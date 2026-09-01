import mongoose from "mongoose";
import { ICryptoDeposit } from "../types/crypto.types";
import { TransactionStatus } from "../types/transaction.types";

const cryptoDepositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cryptoAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CryptoAsset",
      required: true,
    },
    // Unique — the same on-chain transaction can only ever be claimed once,
    // which is what stops two users (or one user twice) claiming one payment.
    txHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    claimedAmount: {
      type: Number,
      required: true,
    },
    verifiedAmount: {
      type: Number,
      required: false,
    },
    confirmations: {
      type: Number,
      required: false,
      default: 0,
    },
    rateApplied: {
      type: Number,
      required: false,
    },
    nairaCredited: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    failureReason: {
      type: String,
      required: false,
    },
    checkAttempts: {
      type: Number,
      default: 0,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

cryptoDepositSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cryptoDepositSchema.set("toObject", { virtuals: true });
cryptoDepositSchema.set("toJSON", { virtuals: true, versionKey: false });

export const CryptoDepositModel = mongoose.model<ICryptoDeposit>(
  "CryptoDeposit",
  cryptoDepositSchema,
);
