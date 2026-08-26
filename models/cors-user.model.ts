import mongoose from "mongoose";

const cashOnRailsUsersSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer_code: { type: String, required: true },
    reserved_account: { type: Object },
  },
  {
    timestamps: true,
  }
);

export const cashOnRailsUsersModel = mongoose.model(
  "cashOnRailsUsers",
  cashOnRailsUsersSchema
);
