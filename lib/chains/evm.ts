import { ChainAssetContext, ChainVerificationResult, ChainVerifier } from "./type";
import { formatUnits } from "./units";

// keccak256("Transfer(address,address,uint256)") — the standard ERC20/BEP20
// Transfer event topic. Identical on every EVM chain.
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

interface EvmTransaction {
  to: string | null;
  value: string; // hex wei
  blockNumber: string | null; // hex, null if pending
}

interface EvmLog {
  address: string;
  topics: string[];
  data: string;
}

interface EvmReceipt {
  status: string; // "0x1" | "0x0"
  blockNumber: string | null;
  logs: EvmLog[];
}

/** Works for any EVM chain (Ethereum, BSC, ...) — just point it at the right RPC. */
export class EvmVerifier implements ChainVerifier {
  constructor(private rpcUrl: string) {}

  private async rpcCall<T>(method: string, params: unknown[]): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

    const body = await response.json();

    if (body.error) {
      throw new Error(`EVM RPC ${method} failed: ${body.error.message}`);
    }

    return body.result as T;
  }

  async verifyTransaction(
    txHash: string,
    context: ChainAssetContext,
  ): Promise<ChainVerificationResult> {
    const tx = await this.rpcCall<EvmTransaction | null>(
      "eth_getTransactionByHash",
      [txHash],
    );

    if (!tx) {
      return { found: false, success: false, confirmations: 0, matchesDepositAddress: false };
    }

    const receipt = await this.rpcCall<EvmReceipt | null>(
      "eth_getTransactionReceipt",
      [txHash],
    );

    if (!receipt || !receipt.blockNumber) {
      // Known to the mempool/node but not mined into a block yet.
      return {
        found: true,
        success: false,
        confirmations: 0,
        matchesDepositAddress: false,
        raw: { tx, receipt },
      };
    }

    const currentBlockHex = await this.rpcCall<string>("eth_blockNumber", []);
    const currentBlock = parseInt(currentBlockHex, 16);
    const txBlock = parseInt(receipt.blockNumber, 16);
    const confirmations = Math.max(0, currentBlock - txBlock + 1);
    const success = receipt.status === "0x1";

    if (!success) {
      return {
        found: true,
        success: false,
        confirmations,
        matchesDepositAddress: false,
        blockNumber: txBlock,
        raw: { tx, receipt },
      };
    }

    if (context.contractAddress) {
      const transferLog = receipt.logs.find(
        (log) =>
          log.address?.toLowerCase() === context.contractAddress!.toLowerCase() &&
          log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC &&
          log.topics.length >= 3,
      );

      if (!transferLog) {
        // Mined and successful, but no Transfer log for this token — not a
        // deposit of this asset (wrong token, or a non-transfer contract call).
        return {
          found: true,
          success: true,
          confirmations,
          matchesDepositAddress: false,
          blockNumber: txBlock,
          raw: { tx, receipt },
        };
      }

      const toAddress = "0x" + transferLog.topics[2].slice(-40);
      const amount = formatUnits(BigInt(transferLog.data), context.decimals);

      return {
        found: true,
        success: true,
        confirmations,
        toAddress,
        matchesDepositAddress: toAddress.toLowerCase() === context.address.toLowerCase(),
        amount,
        blockNumber: txBlock,
        raw: { tx, receipt },
      };
    }

    // Native coin transfer (ETH/BNB) — no contract, read tx.value directly.
    const amount = formatUnits(BigInt(tx.value), context.decimals);

    return {
      found: true,
      success: true,
      confirmations,
      toAddress: tx.to ?? undefined,
      matchesDepositAddress: (tx.to ?? "").toLowerCase() === context.address.toLowerCase(),
      amount,
      blockNumber: txBlock,
      raw: { tx, receipt },
    };
  }
}
