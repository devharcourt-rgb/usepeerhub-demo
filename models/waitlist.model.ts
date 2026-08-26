import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    emailAddress: {
      type: String,
      required: [true, "Email Address is required"],
      unique: [true, "Email Address already in waitlist"],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const WaitlistModel = mongoose.model("Waitlist", waitlistSchema);
