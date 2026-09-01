import { CryptoNetwork } from "../../types/crypto.types";
import { ChainVerifier } from "./type";
import { EvmVerifier } from "./evm";
import { BitcoinVerifier } from "./bitcoin";
import { SolanaVerifier } from "./solana";

// Defaults are free public endpoints so this works out of the box in dev —
// none of them are appropriate for production deposit verification (rate
// limits, no SLA). Set the *_RPC_URL env vars to dedicated providers before
// relying on this with real money.
const ETH_RPC_URL = process.env.ETH_RPC_URL || "https://ethereum-rpc.publicnode.com";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "https://bsc-rpc.publicnode.com";
const BTC_ESPLORA_URL = process.env.BTC_ESPLORA_URL || "https://blockstream.info/api";
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

let verifiers: Record<CryptoNetwork, ChainVerifier> | null = null;

function buildVerifiers(): Record<CryptoNetwork, ChainVerifier> {
  return {
    [CryptoNetwork.ETH]: new EvmVerifier(ETH_RPC_URL),
    [CryptoNetwork.BSC]: new EvmVerifier(BSC_RPC_URL),
    [CryptoNetwork.BTC]: new BitcoinVerifier(BTC_ESPLORA_URL),
    [CryptoNetwork.SOLANA]: new SolanaVerifier(SOLANA_RPC_URL),
  };
}

/** Lazily built and cached — building eagerly at import time would read env vars before dotenv has loaded. */
export function getChainVerifier(network: CryptoNetwork): ChainVerifier {
  if (!verifiers) {
    verifiers = buildVerifiers();
  }

  return verifiers[network];
}
