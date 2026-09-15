import mongoose from "mongoose";
import { ICurrency } from "../types/currency.types";

const currencySchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    // Rate to convert 1 unit of this currency into NGN (e.g. how many Naira
    // for $1). Admin-set only — see CurrencyService.getRateToNGN for the
    // default this falls back to while unset.
    rateToNGN: {
      type: Number,
      required: false,
    },
    rateUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    rateUpdatedAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

currencySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

currencySchema.set("toObject", { virtuals: true });
currencySchema.set("toJSON", { virtuals: true, versionKey: false });

export const CurrencyModel = mongoose.model<ICurrency>(
  "Currency",
  currencySchema,
);
