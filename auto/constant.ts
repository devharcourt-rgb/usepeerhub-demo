import { AdminRole } from "../types/role.types";
import { CryptoNetwork, CryptoStandard } from "../types/crypto.types";

export const ROOT_USER = {
  firstName: "Hamsa",
  lastName: "Harcourt",
  emailAddress: "hamsa@userpeerhub.com",
  password: "@usepeerhub",
  username: "superadmin",
  dateOfBirth: new Date("2000-04-08"),
  phoneNumber: "+2349070073451",
  phoneBP: "09070073451",
  middleName: "Ohabiko",
};

export const ROOT_USER_BVN = "22530138077";

export const DEFAULT_ROLES = [
  {
    name: AdminRole.ADMIN,
  },
  {
    name: AdminRole.SUPERADMIN,
  },
  {
    name: AdminRole.OPERATOR,
  },
];

export const DEFAULT_TEAM = {
  name: "Default Team",
  members: [],
  createdBy: "649750024d3481024d348102",
};

export const DEFAULT_CURRENCIES = [
  // nigerian naira
  {
    name: "Naira",
    code: "NGN",
    symbol: "₦",
    country: "Nigeria",
    isDefault: true,
  },
  // us dollars
  {
    name: "Dollar",
    code: "USD",
    symbol: "$",
    country: "United States",
    isDefault: false,
  },
];

// A placeholder, deliberately not a real address on any chain — the real
// value must be set by an admin (PATCH /admin/crypto/assets/:id) before an
// asset is safe to activate. Never replace this with a guessed real address.
const UNSET_ADDRESS = "SET-REAL-DEPOSIT-ADDRESS";

/**
 * The reference catalog for every crypto asset this app currently supports
 * chain verification for (see lib/chains/registry.ts). Seeded metadata only
 * — `address` (and `contractAddress` for tokens) are left for an admin to
 * fill in for real, and every row seeds `active: false` regardless of what's
 * passed here, so nothing goes live from a seed run alone.
 *
 * Note for EVM assets: ETH/USDT-ERC20/USDC-ERC20 can all share one Ethereum
 * address, and BNB/USDT-BEP20 can share one BSC address — an admin doesn't
 * need three separate wallets per chain.
 */
export const DEFAULT_CRYPTO_ASSETS = [
  {
    symbol: "BTC",
    network: CryptoNetwork.BTC,
    standard: CryptoStandard.NATIVE,
    displayName: "Bitcoin (BTC)",
    address: UNSET_ADDRESS,
    decimals: 8,
    minDeposit: 0.0001,
    requiredConfirmations: 2,
  },
  {
    symbol: "ETH",
    network: CryptoNetwork.ETH,
    standard: CryptoStandard.NATIVE,
    displayName: "Ethereum (ETH)",
    address: UNSET_ADDRESS,
    decimals: 18,
    minDeposit: 0.001,
    requiredConfirmations: 15,
  },
  {
    symbol: "BNB",
    network: CryptoNetwork.BSC,
    standard: CryptoStandard.NATIVE,
    displayName: "BNB (BSC)",
    address: UNSET_ADDRESS,
    decimals: 18,
    minDeposit: 0.01,
    requiredConfirmations: 15,
  },
  {
    symbol: "SOL",
    network: CryptoNetwork.SOLANA,
    standard: CryptoStandard.NATIVE,
    displayName: "Solana (SOL)",
    address: UNSET_ADDRESS,
    decimals: 9,
    minDeposit: 0.01,
    // Solana's finality model doesn't use a confirmation count — the
    // verifier reports 1 once "finalized" is reached, 0 otherwise.
    requiredConfirmations: 1,
  },
  {
    symbol: "USDT",
    network: CryptoNetwork.ETH,
    standard: CryptoStandard.ERC20,
    displayName: "USDT (ERC20)",
    address: UNSET_ADDRESS,
    // contractAddress intentionally omitted — set the real USDT contract
    // address before activating.
    decimals: 6,
    minDeposit: 1,
    requiredConfirmations: 15,
  },
  {
    symbol: "USDT",
    network: CryptoNetwork.BSC,
    standard: CryptoStandard.BEP20,
    displayName: "USDT (BEP20)",
    address: UNSET_ADDRESS,
    // contractAddress intentionally omitted — set the real USDT contract
    // address before activating.
    // NOTE: Binance-Peg USDT uses 18 decimals, unlike USDT on Ethereum/Tron
    // (6) — this is a well-known trap, don't "fix" it to match the others.
    decimals: 18,
    minDeposit: 1,
    requiredConfirmations: 15,
  },
  {
    symbol: "USDC",
    network: CryptoNetwork.ETH,
    standard: CryptoStandard.ERC20,
    displayName: "USDC (ERC20)",
    address: UNSET_ADDRESS,
    // contractAddress intentionally omitted — set the real USDC contract
    // address before activating.
    decimals: 6,
    minDeposit: 1,
    requiredConfirmations: 15,
  },
];
