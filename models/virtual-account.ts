import mongoose from "mongoose";
import {
  IVirtualAccount,
  VirtualAccountType,
} from "../types/virtual-account.type";

const virtualAcccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      unique: [true, "Account number already exists"],
    },
    type: {
      type: String,
      enum: Object.values(VirtualAccountType),
      default: VirtualAccountType.INTERNAL,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    accountID: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

virtualAcccountSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

virtualAcccountSchema.set("toObject", { virtuals: true });

virtualAcccountSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

export const VirtualAccountModel = mongoose.model<IVirtualAccount>(
  "VirtualAccount",
  virtualAcccountSchema
);
