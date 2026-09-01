import mongoose from "mongoose";
import {
  CryptoNetwork,
  CryptoStandard,
  ICryptoAsset,
} from "../types/crypto.types";

const cryptoAssetSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    network: {
      type: String,
      enum: Object.values(CryptoNetwork),
      required: true,
    },
    standard: {
      type: String,
      enum: Object.values(CryptoStandard),
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    // The establishment's shared deposit address for this asset+network.
    // Set only through the admin API — never seeded/hardcoded in code.
    address: {
      type: String,
      required: true,
    },
    // Token contract/mint address — required for anything but NATIVE.
    // Also admin-set only.
    contractAddress: {
      type: String,
      required: false,
    },
    decimals: {
      type: Number,
      required: true,
    },
    rateToNGN: {
      type: Number,
      required: true,
      default: 0,
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
    minDeposit: {
      type: Number,
      required: true,
      default: 0,
    },
    requiredConfirmations: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: false, // stays inactive until an admin sets a real address + rate
    },
  },
  {
    timestamps: true,
  },
);

cryptoAssetSchema.index({ symbol: 1, network: 1, standard: 1 }, { unique: true });

cryptoAssetSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cryptoAssetSchema.set("toObject", { virtuals: true });
cryptoAssetSchema.set("toJSON", { virtuals: true, versionKey: false });

export const CryptoAssetModel = mongoose.model<ICryptoAsset>(
  "CryptoAsset",
  cryptoAssetSchema,
);
