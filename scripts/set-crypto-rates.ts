/**
 * One-off / periodic script: fetches live market rates and sets rateToNGN
 * on every CryptoAsset currently in the database (whatever DEFAULT_CRYPTO_ASSETS
 * has seeded, plus anything an admin has added since — this reads the DB,
 * it does not hardcode the coin list).
 *
 * Data source: CoinGecko's public /simple/price endpoint (no API key needed).
 *
 * Usage:
 *   npx ts-node scripts/set-crypto-rates.ts --dry-run   # preview only, no writes
 *   npx ts-node scripts/set-crypto-rates.ts             # apply
 *   npx ts-node scripts/set-crypto-rates.ts --force     # also apply rates that
 *                                                        # trip the sanity guard below
 *
 * Run against production by giving it production's MONGO_URL — e.g. via
 * `railway run npx ts-node scripts/set-crypto-rates.ts --dry-run` so it picks up
 * the service's real environment, or by exporting MONGO_URL locally yourself.
 *
 * Safe to re-run: each run just writes the latest fetched rate and appends
 * one CryptoRateHistoryModel entry per asset actually changed (via the same
 * CryptoService.setRate used by the admin "set rate" endpoint).
 */
import dotenv from "dotenv";
dotenv.config();

import { db } from "../config/database";
import { CryptoAssetModel } from "../models/crypto-asset.model";
import { AdminModel } from "../models/admin.model";
import { CryptoService } from "../services/crypto.service";
import { ROOT_USER } from "../auto/constant";

// Which CoinGecko coin id prices a given CryptoAsset symbol. USDT/USDC map
// to the same id regardless of which chain they're on (ERC20 vs BEP20,
// etc.) — it's the same asset, priced the same, just deposited on different
// networks. Add an entry here before this script can price a new symbol.
const COINGECKO_ID_BY_SYMBOL: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  USDT: "tether",
  USDC: "usd-coin",
};

// If a fetched rate differs from the asset's current rate by more than this
// fraction, skip that asset instead of applying it silently. This is real
// money-pricing logic in production — a bad/stale API response should never
// be able to 10x-mispricing an asset unattended. Pass --force to override
// (e.g. after a genuine, verified market move this large).
const MAX_DEVIATION_WITHOUT_FORCE = 0.3;

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

async function fetchJsonWithRetry(url: string, attempts = 3): Promise<any> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`request failed: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  throw lastError;
}

async function fetchRatesToNGN(
  coinGeckoIds: string[],
): Promise<Record<string, number>> {
  const idsParam = [...new Set(coinGeckoIds)].join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=ngn`;

  const data = (await fetchJsonWithRetry(url)) as Record<
    string,
    { ngn?: number }
  >;

  const rates: Record<string, number> = {};

  for (const id of new Set(coinGeckoIds)) {
    const ngn = data[id]?.ngn;

    if (typeof ngn !== "number" || !Number.isFinite(ngn) || ngn <= 0) {
      console.warn(
        `⚠️  No usable NGN rate returned for CoinGecko id "${id}" — skipping.`,
      );
      continue;
    }

    rates[id] = ngn;
  }

  return rates;
}

/** Whichever admin this rate update gets attributed to in the audit history. */
async function resolveSystemAdminId(): Promise<string> {
  const email = process.env.RATE_SCRIPT_ADMIN_EMAIL || ROOT_USER.emailAddress;
  const admin = await AdminModel.findOne({ emailAddress: email });

  if (!admin) {
    throw new Error(
      `Could not find an Admin with email "${email}" to attribute this rate update to. ` +
        `Set RATE_SCRIPT_ADMIN_EMAIL to an existing admin's email address.`,
    );
  }

  return admin.id;
}

async function run() {
  console.log(
    DRY_RUN
      ? "🔎 DRY RUN — fetching live rates, no writes will be made.\n"
      : "🚀 Setting live crypto rates...\n",
  );

  const assets = await CryptoAssetModel.find().sort({ symbol: 1, network: 1 });

  if (!assets.length) {
    console.log("No crypto assets found in the database — nothing to do.");
    return;
  }

  const neededIds = assets
    .map((asset) => COINGECKO_ID_BY_SYMBOL[asset.symbol])
    .filter((id): id is string => Boolean(id));

  const rates = await fetchRatesToNGN(neededIds);

  const adminId = DRY_RUN ? null : await resolveSystemAdminId();
  const cryptoService = new CryptoService();

  let updated = 0;
  let skipped = 0;

  for (const asset of assets) {
    const label = `${asset.symbol} (${asset.network}/${asset.standard})`;
    const coingeckoId = COINGECKO_ID_BY_SYMBOL[asset.symbol];

    if (!coingeckoId) {
      console.warn(
        `⚠️  ${label}: no CoinGecko mapping for this symbol — skipping. ` +
          `Add it to COINGECKO_ID_BY_SYMBOL in this script.`,
      );
      skipped++;
      continue;
    }

    const newRate = rates[coingeckoId];

    if (newRate === undefined) {
      console.warn(
        `⚠️  ${label}: rate fetch failed for "${coingeckoId}" — skipping.`,
      );
      skipped++;
      continue;
    }

    const oldRate = asset.rateToNGN;

    if (oldRate > 0 && !FORCE) {
      const deviation = Math.abs(newRate - oldRate) / oldRate;

      if (deviation > MAX_DEVIATION_WITHOUT_FORCE) {
        console.warn(
          `⚠️  ${label}: new rate ₦${newRate} differs from current ₦${oldRate} ` +
            `by ${(deviation * 100).toFixed(1)}% (over the ${MAX_DEVIATION_WITHOUT_FORCE * 100}% guard) ` +
            `— skipping. Re-run with --force to apply anyway if this is a genuine market move.`,
        );
        skipped++;
        continue;
      }
    }

    console.log(`${label}: ₦${oldRate} → ₦${newRate}`);

    if (!DRY_RUN) {
      await cryptoService.setRate(asset.id, newRate, adminId as string);
    }

    updated++;
  }

  console.log(
    `\n${DRY_RUN ? "Would update" : "Updated"} ${updated} asset(s), skipped ${skipped}.`,
  );
}

db.once("connected", () => {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Rate update failed:", error);
      process.exit(1);
    });
});

db.once("error", (error) => {
  console.error("❌ Could not connect to the database:", error);
  process.exit(1);
});
