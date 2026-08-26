import mongoose from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../types/transaction.types";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PROCESSING,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      default: TransactionType.CREDIT,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    flagged: {
      type: Boolean,
      default: undefined,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "flaggedByModel",
      required: false,
    },
    flaggedByModel: {
      type: String,
      enum: ["User", "Admin"],
      required: false,
    },
    requestId: {
      type: String,
      required: false,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transactionSchema.set("toObject", { virtuals: true });

transactionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Only check on new document creation
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

    const duplicateTransaction = await TransactionModel.findOne({
      user: this.user,
      type: this.type,
      createdAt: { $gte: tenSecondsAgo },
    });

    if (duplicateTransaction) {
      const error = new Error(
        "Possible duplicate transaction detected. Please wait 10 seconds before trying again."
      );
      return next(error);
    }
  }

  next();
});

export const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
