import { ChainAssetContext, ChainVerificationResult, ChainVerifier } from "./type";
import { formatUnits } from "./units";

interface EsploraVout {
  scriptpubkey_address?: string;
  value: number; // satoshis
}

interface EsploraTx {
  vout: EsploraVout[];
  status: {
    confirmed: boolean;
    block_height?: number;
  };
}

/** Uses Blockstream's public Esplora API — no API key required. */
export class BitcoinVerifier implements ChainVerifier {
  constructor(private baseUrl: string) {}

  async verifyTransaction(
    txHash: string,
    context: ChainAssetContext,
  ): Promise<ChainVerificationResult> {
    const txResponse = await fetch(`${this.baseUrl}/tx/${txHash}`);

    if (txResponse.status === 404) {
      return { found: false, success: false, confirmations: 0, matchesDepositAddress: false };
    }

    if (!txResponse.ok) {
      throw new Error(`Esplora /tx failed: ${txResponse.status}`);
    }

    const tx: EsploraTx = await txResponse.json();

    // Sum every output paying our address — a single deposit tx could
    // (unusually) split value across more than one matching output.
    const matchingOutputs = tx.vout.filter(
      (vout) => vout.scriptpubkey_address?.toLowerCase() === context.address.toLowerCase(),
    );

    if (!tx.status.confirmed || tx.status.block_height === undefined) {
      return {
        found: true,
        success: false,
        confirmations: 0,
        toAddress: matchingOutputs[0]?.scriptpubkey_address,
        matchesDepositAddress: matchingOutputs.length > 0,
        raw: tx,
      };
    }

    const tipResponse = await fetch(`${this.baseUrl}/blocks/tip/height`);

    if (!tipResponse.ok) {
      throw new Error(`Esplora /blocks/tip/height failed: ${tipResponse.status}`);
    }

    const tipHeight = parseInt(await tipResponse.text(), 10);
    const confirmations = Math.max(0, tipHeight - tx.status.block_height + 1);

    if (matchingOutputs.length === 0) {
      return {
        found: true,
        success: true,
        confirmations,
        matchesDepositAddress: false,
        blockNumber: tx.status.block_height,
        raw: tx,
      };
    }

    const totalSats = matchingOutputs.reduce(
      (sum, vout) => sum + BigInt(vout.value),
      BigInt(0),
    );

    return {
      found: true,
      success: true,
      confirmations,
      toAddress: context.address,
      matchesDepositAddress: true,
      amount: formatUnits(totalSats, context.decimals),
      blockNumber: tx.status.block_height,
      raw: tx,
    };
  }
}
