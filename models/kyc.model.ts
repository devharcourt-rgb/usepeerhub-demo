import mongoose, { Schema } from "mongoose";
import { IKYC, KYCDocument, KYCStatus } from "../types/kyc.types";

const kycSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(KYCStatus),
      default: KYCStatus.UNVERIFIED,
    },
    tier: {
      type: Number,
      required: true,
    },
    documentType: {
      type: String,
      enum: Object.values(KYCDocument),
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
    },
    documentImage: {
      type: String,
      required: true,
    },
    selfieImage: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add a virtual `id` field
kycSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting Mongoose documents to JSON or Objects:
kycSchema.set("toObject", { virtuals: true });

// Ensure virtual fields are included when converting Mongoose documents to JSON or Objects:
kycSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;

    return ret;
  },
});

export const KycModel = mongoose.model<IKYC>("Kyc", kycSchema);
