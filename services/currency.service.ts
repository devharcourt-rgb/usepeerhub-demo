import mongoose from "mongoose";
import { CurrencyModel } from "../models/currency.model";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";

/**
 * Used for a currency whenever no admin has set a real rateToNGN yet —
 * including currencies seeded before this field existed. Keep this in sync
 * with anywhere the product promises a specific default (e.g. "$1 = ₦1,400"
 * for USD).
 */
export const DEFAULT_RATES_TO_NGN: Record<string, number> = {
  USD: 1400,
};

export class CurrencyService {
  /**
   * Rate to convert 1 unit of `code` into NGN. Never throws for a missing
   * currency/rate — falls back to DEFAULT_RATES_TO_NGN, or 1 if the code
   * isn't in that map either.
   */
  async getRateToNGN(code: string): Promise<number> {
    const currency = await CurrencyModel.findOne({ code });

    if (currency && currency.rateToNGN != null) {
      return currency.rateToNGN;
    }

    return DEFAULT_RATES_TO_NGN[code] ?? 1;
  }

  async setRateToNGN(code: string, rateToNGN: number, adminId: string) {
    const currency = await CurrencyModel.findOne({ code });

    if (!currency) {
      throw new HTTPException(
        HTTPStatus.NOT_FOUND,
        `Currency "${code}" not found`,
      );
    }

    currency.rateToNGN = rateToNGN;
    currency.rateUpdatedBy = new mongoose.Types.ObjectId(adminId);
    currency.rateUpdatedAt = new Date();
    await currency.save();

    return currency;
  }
}
