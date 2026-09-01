import mongoose from "mongoose";
import { TransactionStatus } from "./transaction.types";

/** The chain a CryptoAsset lives on — determines which ChainVerifier checks its deposits. */
export enum CryptoNetwork {
  BTC = "BTC",
  ETH = "ETH",
  BSC = "BSC",
  SOLANA = "SOLANA",
}

/** Whether the asset is a chain's native coin or a token riding on it. */
export enum CryptoStandard {
  NATIVE = "native",
  ERC20 = "ERC20",
  BEP20 = "BEP20",
  SPL = "SPL",
}

/**
 * A deposit's own lifecycle re-uses TransactionStatus so it lines up with
 * the ledger Transaction it eventually produces:
 *   PENDING    — submitted, not yet seen on-chain
 *   PROCESSING — seen on-chain, waiting on confirmations
 *   COMPLETED  — confirmed and credited to the user's balance
 *   FAILED     — wrong recipient, timed out, or never found
 */
export { TransactionStatus as CryptoDepositStatus };

export interface ICryptoAsset {
  symbol: string; // e.g. "USDT", "BTC"
  network: CryptoNetwork;
  standard: CryptoStandard;
  displayName: string; // e.g. "USDC (ERC20)"
  /** The establishment's shared deposit address for this asset+network. Admin-set — never hardcoded. */
  address: string;
  /** Token contract/mint address — required for non-native standards. Admin-set — never hardcoded. */
  contractAddress?: string;
  decimals: number;
  rateToNGN: number;
  rateUpdatedBy?: mongoose.Types.ObjectId | string;
  rateUpdatedAt?: Date;
  minDeposit: number;
  requiredConfirmations: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICryptoDeposit {
  user: mongoose.Types.ObjectId | string;
  cryptoAsset: mongoose.Types.ObjectId | string;
  txHash: string;
  claimedAmount: number; // what the user says they sent — never trusted for crediting
  verifiedAmount?: number; // what the chain verifier actually found
  confirmations?: number;
  rateApplied?: number;
  nairaCredited?: number; // in kobo, matching every other ledger amount
  status: TransactionStatus;
  failureReason?: string;
  checkAttempts: number;
  transaction?: mongoose.Types.ObjectId | string; // the CREDIT Transaction once completed
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICryptoRateHistory {
  cryptoAsset: mongoose.Types.ObjectId | string;
  rateToNGN: number;
  setBy: mongoose.Types.ObjectId | string;
  createdAt?: Date;
}
