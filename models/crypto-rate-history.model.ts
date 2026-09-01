import mongoose from "mongoose";
import { ICryptoRateHistory } from "../types/crypto.types";

const cryptoRateHistorySchema = new mongoose.Schema(
  {
    cryptoAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CryptoAsset",
      required: true,
    },
    rateToNGN: {
      type: Number,
      required: true,
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const CryptoRateHistoryModel = mongoose.model<ICryptoRateHistory>(
  "CryptoRateHistory",
  cryptoRateHistorySchema,
);
