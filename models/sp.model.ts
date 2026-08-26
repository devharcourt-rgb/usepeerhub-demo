import mongoose from "mongoose";

const safulpayWebhookLogSchema = new mongoose.Schema(
  {
      expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      index: { expires: '0s' },
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const SafulPayWebhookLogModel = mongoose.model(
  "SafulPayWebhookLog",
  safulpayWebhookLogSchema
);
