import { ChainAssetContext, ChainVerificationResult, ChainVerifier } from "./type";
import { formatUnits } from "./units";

interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { amount: string; decimals: number };
}

interface SolanaTransactionResult {
  slot: number;
  meta: {
    err: unknown | null;
    preBalances: number[];
    postBalances: number[];
    preTokenBalances?: TokenBalance[];
    postTokenBalances?: TokenBalance[];
  };
  transaction: {
    message: { accountKeys: (string | { pubkey: string })[] };
  };
}

/**
 * Uses a public Solana JSON-RPC endpoint (getTransaction). Solana's finality
 * model doesn't map onto a simple confirmation count the way block-based
 * chains do, so this treats "finalized" commitment as done (confirmations:
 * 1) and "confirmed but not yet finalized" as still-pending (confirmations: 0)
 * — CryptoAsset.requiredConfirmations should be set to 1 for SOL-based assets.
 */
export class SolanaVerifier implements ChainVerifier {
  constructor(private rpcUrl: string) {}

  private async getTransaction(
    txHash: string,
    commitment: "finalized" | "confirmed",
  ): Promise<SolanaTransactionResult | null> {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [txHash, { encoding: "json", maxSupportedTransactionVersion: 0, commitment }],
      }),
    });

    const body = await response.json();

    if (body.error) {
      throw new Error(`Solana RPC getTransaction failed: ${body.error.message}`);
    }

    return body.result ?? null;
  }

  private accountKeyString(key: string | { pubkey: string }): string {
    return typeof key === "string" ? key : key.pubkey;
  }

  private extractResult(
    tx: SolanaTransactionResult,
    confirmations: number,
    context: ChainAssetContext,
  ): ChainVerificationResult {
    const success = tx.meta.err === null;

    if (!success) {
      return { found: true, success: false, confirmations, matchesDepositAddress: false, raw: tx };
    }

    if (context.contractAddress) {
      // SPL token transfer — match by mint + owner in the post-token-balances.
      const post = (tx.meta.postTokenBalances ?? []).find(
        (balance) =>
          balance.mint === context.contractAddress && balance.owner === context.address,
      );

      if (!post) {
        return { found: true, success: true, confirmations, matchesDepositAddress: false, raw: tx };
      }

      const pre = (tx.meta.preTokenBalances ?? []).find(
        (balance) => balance.accountIndex === post.accountIndex,
      );

      const postAmount = BigInt(post.uiTokenAmount.amount);
      const preAmount = pre ? BigInt(pre.uiTokenAmount.amount) : BigInt(0);
      const delta = postAmount - preAmount;

      if (delta <= BigInt(0)) {
        return { found: true, success: true, confirmations, matchesDepositAddress: false, raw: tx };
      }

      return {
        found: true,
        success: true,
        confirmations,
        toAddress: context.address,
        matchesDepositAddress: true,
        amount: formatUnits(delta, post.uiTokenAmount.decimals),
        raw: tx,
      };
    }

    // Native SOL transfer — diff pre/post lamport balances for our account.
    const accountKeys = tx.transaction.message.accountKeys.map((key) =>
      this.accountKeyString(key),
    );
    const index = accountKeys.findIndex((key) => key === context.address);

    if (index === -1) {
      return { found: true, success: true, confirmations, matchesDepositAddress: false, raw: tx };
    }

    const delta = BigInt(tx.meta.postBalances[index]) - BigInt(tx.meta.preBalances[index]);

    if (delta <= BigInt(0)) {
      return { found: true, success: true, confirmations, matchesDepositAddress: false, raw: tx };
    }

    return {
      found: true,
      success: true,
      confirmations,
      toAddress: context.address,
      matchesDepositAddress: true,
      amount: formatUnits(delta, context.decimals),
      raw: tx,
    };
  }

  async verifyTransaction(
    txHash: string,
    context: ChainAssetContext,
  ): Promise<ChainVerificationResult> {
    const finalized = await this.getTransaction(txHash, "finalized");

    if (finalized) {
      return this.extractResult(finalized, 1, context);
    }

    const confirmed = await this.getTransaction(txHash, "confirmed");

    if (confirmed) {
      return this.extractResult(confirmed, 0, context);
    }

    return { found: false, success: false, confirmations: 0, matchesDepositAddress: false };
  }
}
