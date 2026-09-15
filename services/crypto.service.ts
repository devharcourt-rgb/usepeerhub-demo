import mongoose from "mongoose";
import { CryptoAssetModel } from "../models/crypto-asset.model";
import { CryptoDepositModel } from "../models/crypto-deposit.model";
import { CryptoRateHistoryModel } from "../models/crypto-rate-history.model";
import { TransactionModel } from "../models/transaction.model";
import { CurrencyModel } from "../models/currency.model";
import { CurrencyService } from "./currency.service";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../types/transaction.types";
import { getChainVerifier } from "../lib/chains/registry";
import { ChainVerificationResult } from "../lib/chains/type";
import redisConnection from "../config/redis";
import QueueProducer from "../queue/producer";
import { DEFAULT_REDIS_QUEUE } from "../global/queue";

// How often the background job re-checks a deposit that isn't resolved yet,
// and how many times it'll try before giving up and marking it FAILED.
// 30s * 2880 = ~24h.
export const CRYPTO_CHECK_DELAY_MS = 30_000;
export const CRYPTO_MAX_CHECK_ATTEMPTS = 2880;

const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);
const currencyService = new CurrencyService();

export interface VerifyDepositOutcome {
  requeue: boolean;
  deposit: any;
}

export class CryptoService {
  // ---------------------------------------------------------------------
  // User-facing
  // ---------------------------------------------------------------------

  /** Assets users are shown to deposit into — address + current rate. */
  async listActiveAssets(query: Record<string, unknown> = {}) {
    return CryptoAssetModel.find(query).sort({ symbol: 1, network: 1 });
  }

  /**
   * The rate board users see — just what's needed to price a deposit,
   * for active assets only. Deliberately excludes the deposit address and
   * everything else on the asset.
   */
  async listRates() {
    return CryptoAssetModel.aggregate([
      { $match: { active: true } },
      { $sort: { symbol: 1, network: 1 } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          displayName: 1,
          rateToNGN: 1,
          symbol: 1,
          network: 1,
        },
      },
    ]);
  }

  /**
   * The user's balance for every active crypto asset, in the asset's own
   * unit plus its NGN and USD equivalents at current rates. Every active
   * asset is always included — one with no completed deposits comes back
   * at balance 0 rather than being left out.
   *
   * "Balance" here is the sum of on-chain-VERIFIED amounts from COMPLETED
   * deposits only (never claimedAmount, and never a still-PROCESSING
   * deposit that hasn't hit its confirmation threshold yet) — the same
   * trust rule verifyDeposit()/creditDeposit() already apply everywhere
   * else in this file.
   */
  async getUserBalances(userId: string) {
    const [assets, sums, usdToNgnRate] = await Promise.all([
      CryptoAssetModel.find({ active: true }).sort({ symbol: 1, network: 1 }),
      CryptoDepositModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            status: TransactionStatus.COMPLETED,
          },
        },
        {
          $group: {
            _id: "$cryptoAsset",
            balance: { $sum: "$verifiedAmount" },
          },
        },
      ]),
      currencyService.getRateToNGN("USD"),
    ]);

    const balanceByAssetId = new Map<string, number>(
      sums.map((sum: any) => [sum._id.toString(), sum.balance as number]),
    );

    const balances = assets.map((asset) => {
      const balance = balanceByAssetId.get(asset.id) ?? 0;
      const balanceInNGN = balance * asset.rateToNGN;

      return {
        id: asset.id,
        symbol: asset.symbol,
        network: asset.network,
        standard: asset.standard,
        displayName: asset.displayName,
        balance,
        rateToNGN: asset.rateToNGN,
        balanceInNGN,
        balanceInUSD: usdToNgnRate > 0 ? balanceInNGN / usdToNgnRate : 0,
      };
    });

    return { usdToNgnRate, balances };
  }

  async createDeposit(
    userId: string,
    {
      cryptoAssetId,
      claimedAmount,
      txHash,
    }: { cryptoAssetId: string; claimedAmount: number; txHash: string },
  ) {
    const asset = await CryptoAssetModel.findById(cryptoAssetId);

    if (!asset || !asset.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Crypto asset not found or not accepting deposits",
      );
    }

    if (claimedAmount < asset.minDeposit) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        `Minimum deposit for ${asset.symbol} is ${asset.minDeposit}`,
      );
    }

    const normalizedTxHash = txHash.trim();

    // The unique index on txHash is the real guarantee — this check just
    // gives a clean error instead of a raw duplicate-key error.
    const existing = await CryptoDepositModel.findOne({
      txHash: normalizedTxHash,
    });

    if (existing) {
      throw new HTTPException(
        HTTPStatus.CONFLICT,
        "This transaction has already been claimed",
      );
    }

    const deposit = await CryptoDepositModel.create({
      user: userId,
      cryptoAsset: asset._id,
      txHash: normalizedTxHash,
      claimedAmount,
      status: TransactionStatus.PENDING,
    });

    await this.scheduleVerification(deposit._id.toString());

    return deposit;
  }

  async listUserDeposits(userId: string) {
    return CryptoDepositModel.find({ user: userId })
      .populate("cryptoAsset")
      .sort({ createdAt: -1 });
  }

  async getUserDeposit(userId: string, depositId: string) {
    const deposit = await CryptoDepositModel.findOne({
      _id: depositId,
      user: userId,
    }).populate("cryptoAsset");

    if (!deposit) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Deposit not found");
    }

    return deposit;
  }

  // ---------------------------------------------------------------------
  // Verification — the "automated on-chain verification" pipeline
  // ---------------------------------------------------------------------

  async scheduleVerification(depositId: string, delay = 0) {
    await queueProducer.addJob({
      name: "verify-crypto-deposit",
      data: { depositId },
      delay,
      // Attempt-scoped so a legitimate re-check isn't deduped away by BullMQ
      // treating it as the same job as the previous attempt.
      jobId: `crypto-deposit-verify:${depositId}:${Date.now()}`,
    });
  }

  /**
   * The deposit state machine. Called by both the background job and the
   * on-demand /check endpoint — idempotent, and a no-op once the deposit
   * has reached a terminal state (COMPLETED/FAILED).
   */
  async verifyDeposit(depositId: string): Promise<VerifyDepositOutcome> {
    const deposit =
      await CryptoDepositModel.findById(depositId).populate("cryptoAsset");

    if (!deposit) {
      return { requeue: false, deposit: null };
    }

    if (
      deposit.status === TransactionStatus.COMPLETED ||
      deposit.status === TransactionStatus.FAILED
    ) {
      return { requeue: false, deposit };
    }

    const asset = deposit.cryptoAsset as any;

    if (!asset) {
      deposit.status = TransactionStatus.FAILED;
      deposit.failureReason = "Crypto asset no longer exists";
      await deposit.save();
      return { requeue: false, deposit };
    }

    deposit.checkAttempts += 1;

    let result: ChainVerificationResult;

    try {
      const verifier = getChainVerifier(asset.network);
      result = await verifier.verifyTransaction(deposit.txHash, {
        address: asset.address,
        contractAddress: asset.contractAddress,
        decimals: asset.decimals,
      });
    } catch (error) {
      // Provider/network hiccup — not the deposit's fault. Leave status as
      // it is and try again later, unless we've been at this too long.
      console.error(`Crypto deposit ${depositId} verification error:`, error);
      await deposit.save();
      return {
        requeue: deposit.checkAttempts < CRYPTO_MAX_CHECK_ATTEMPTS,
        deposit,
      };
    }

    if (!result.found) {
      if (deposit.checkAttempts >= CRYPTO_MAX_CHECK_ATTEMPTS) {
        deposit.status = TransactionStatus.FAILED;
        deposit.failureReason =
          "Transaction was never found on-chain within the review window";
        await deposit.save();
        return { requeue: false, deposit };
      }
      await deposit.save();
      return { requeue: true, deposit };
    }

    if (!result.success) {
      if (result.blockNumber !== undefined) {
        // Mined but failed (e.g. a reverted EVM tx) — this is terminal.
        deposit.status = TransactionStatus.FAILED;
        deposit.failureReason = "Transaction failed on-chain";
        deposit.metadata = { ...deposit.metadata, lastCheck: result };
        await deposit.save();
        return { requeue: false, deposit };
      }
      // Still sitting unmined — keep waiting.
      await deposit.save();
      return { requeue: true, deposit };
    }

    if (!result.matchesDepositAddress) {
      deposit.status = TransactionStatus.FAILED;
      deposit.failureReason =
        "Transaction does not pay the establishment's deposit address for this asset";
      deposit.metadata = { ...deposit.metadata, lastCheck: result };
      await deposit.save();
      return { requeue: false, deposit };
    }

    deposit.verifiedAmount = result.amount;
    deposit.confirmations = result.confirmations;
    deposit.metadata = { ...deposit.metadata, lastCheck: result };

    if (result.confirmations < asset.requiredConfirmations) {
      deposit.status = TransactionStatus.PROCESSING;
      await deposit.save();
      return { requeue: true, deposit };
    }

    if (!result.amount || result.amount <= 0) {
      deposit.status = TransactionStatus.FAILED;
      deposit.failureReason = "Verified on-chain amount was zero";
      await deposit.save();
      return { requeue: false, deposit };
    }

    await this.creditDeposit(deposit, asset, result.amount);

    return { requeue: false, deposit };
  }

  /** Credits the wallet using the on-chain VERIFIED amount — the user's claimed amount is never trusted for this. */
  private async creditDeposit(
    deposit: any,
    asset: any,
    verifiedAmount: number,
  ) {
    const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        "Nigerian Naira currency not found",
      );
    }

    // rateToNGN is Naira per 1 unit of the asset; the ledger stores kobo.
    const nairaAmount = verifiedAmount * asset.rateToNGN;
    const amountInKobo = Math.round(nairaAmount * 100);

    const transaction = await TransactionModel.create({
      user: deposit.user,
      amount: amountInKobo,
      type: TransactionType.CREDIT,
      description: TransactionDescription.CRYPTO_DEPOSIT,
      status: TransactionStatus.COMPLETED,
      currency: nigerianNaira._id,
      metadata: {
        cryptoAsset: asset._id,
        txHash: deposit.txHash,
        verifiedAmount,
        rateApplied: asset.rateToNGN,
      },
    });

    deposit.status = TransactionStatus.COMPLETED;
    deposit.rateApplied = asset.rateToNGN;
    deposit.nairaCredited = amountInKobo;
    deposit.transaction = transaction._id;
    await deposit.save();
  }

  // ---------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------

  async listAllAssets() {
    return CryptoAssetModel.find().sort({ symbol: 1, network: 1 });
  }

  async createAsset(data: {
    symbol: string;
    network: string;
    standard: string;
    displayName: string;
    address: string;
    contractAddress?: string;
    decimals: number;
    minDeposit?: number;
    requiredConfirmations: number;
  }) {
    // Starts inactive on purpose — an admin has to deliberately flip it on
    // once the address/rate look right, rather than a half-configured
    // asset going live by default.
    return CryptoAssetModel.create({ ...data, active: false });
  }

  async updateAsset(
    id: string,
    data: Partial<{
      displayName: string;
      address: string;
      contractAddress: string;
      decimals: number;
      minDeposit: number;
      requiredConfirmations: number;
      active: boolean;
    }>,
  ) {
    const asset = await CryptoAssetModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!asset) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Crypto asset not found");
    }

    return asset;
  }

  async setRate(id: string, rateToNGN: number, adminId: string) {
    const asset = await CryptoAssetModel.findById(id);

    if (!asset) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Crypto asset not found");
    }

    asset.rateToNGN = rateToNGN;
    asset.rateUpdatedBy = new mongoose.Types.ObjectId(adminId);
    asset.rateUpdatedAt = new Date();
    await asset.save();

    await CryptoRateHistoryModel.create({
      cryptoAsset: asset._id,
      rateToNGN,
      setBy: adminId,
    });

    return asset;
  }

  async getRateHistory(cryptoAssetId: string) {
    return CryptoRateHistoryModel.find({ cryptoAsset: cryptoAssetId })
      .populate("setBy", "firstName lastName emailAddress")
      .sort({ createdAt: -1 });
  }

  /** The "who sent what" view — every deposit claim across every user. */
  async listAllDeposits(filter: {
    status?: string;
    userId?: string;
    cryptoAssetId?: string;
  }) {
    const query: Record<string, unknown> = {};

    if (filter.status) query.status = filter.status;
    if (filter.userId) query.user = filter.userId;
    if (filter.cryptoAssetId) query.cryptoAsset = filter.cryptoAssetId;

    return CryptoDepositModel.find(query)
      .populate("user", "firstName lastName emailAddress")
      .populate("cryptoAsset")
      .sort({ createdAt: -1 });
  }
}
