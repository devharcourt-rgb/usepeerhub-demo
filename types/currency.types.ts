import mongoose from "mongoose";

export interface ICurrency {
  symbol: string;
  name: string;
  code: string;
  /**
   * Rate to convert 1 unit of this currency into NGN — e.g. for USD, how
   * many Naira for $1. Admin-set only; falls back to a default (see
   * CurrencyService.DEFAULT_RATES_TO_NGN, 1400 for USD) when unset, so
   * existing currencies seeded before this field existed still resolve to
   * a sane rate.
   */
  rateToNGN?: number;
  rateUpdatedBy?: mongoose.Types.ObjectId | string;
  rateUpdatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
