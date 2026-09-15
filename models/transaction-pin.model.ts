import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import {
  CustomTransactionPinModel,
  ITransactionPin,
} from "../types/transaction-pin.types";

const transactionPinSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    pin: {
      type: String,
      required: [true, "Pin is required"],
    },
  },
  {
    timestamps: true,
  },
);

transactionPinSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transactionPinSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id;
    delete (ret as any).pin;
  },
});

transactionPinSchema.set("toObject", {
  virtuals: true,
});

transactionPinSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);

  next();
});

transactionPinSchema.method("matchPin", async function (pin: string) {
  const pinInDB = this.pin as string;

  return await bcrypt.compare(pin, pinInDB);
});

export const TransactionPinModel = mongoose.model<
  ITransactionPin,
  CustomTransactionPinModel
>("TransactionPin", transactionPinSchema);
