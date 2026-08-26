import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

export const CurrencyModel = mongoose.model("Currency", currencySchema);
