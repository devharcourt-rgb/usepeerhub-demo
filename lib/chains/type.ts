export interface ChainVerificationResult {
  /** Whether the tx hash was found on-chain at all. */
  found: boolean;
  /** True once the tx is a confirmed success (chain-specific meaning of "success"). */
  success: boolean;
  confirmations: number;
  /** Recipient address the value/token was sent to, in the chain's native display format. */
  toAddress?: string;
  /**
   * Whether toAddress is our deposit address. Computed by the verifier, not
   * the caller — a chain-agnostic caller doing a naive string compare could
   * miss a match if a chain's raw API response encodes addresses
   * differently than admins enter them.
   */
  matchesDepositAddress: boolean;
  /** Amount in human units (already divided by decimals) — undefined if not found/parseable. */
  amount?: number;
  blockNumber?: number;
  /** Raw provider response, kept for audit/debugging. */
  raw?: unknown;
}

export interface ChainAssetContext {
  address: string; // establishment's deposit address to match against
  contractAddress?: string; // token contract/mint — undefined for native assets
  decimals: number;
}

export interface ChainVerifier {
  /**
   * Looks up txHash on-chain and reports whether it pays ChainAssetContext.address
   * the given asset, and how many confirmations it has. Never throws for
   * "not found yet" — that's a normal, expected state early in a deposit's
   * life and is represented as `{ found: false }`. Throws only on unexpected
   * provider/network failure, which callers should treat as "try again later".
   */
  verifyTransaction(
    txHash: string,
    context: ChainAssetContext,
  ): Promise<ChainVerificationResult>;
}
