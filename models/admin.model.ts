import mongoose from "mongoose";
import { CustomAdminModel, IAdmin } from "../types/admin.types";
import { AccountStatus } from "../types/user.types";
import bcrypt from "bcrypt";
import { generateRadomDigits } from "../utils/core.utils";

const adminSchema = new mongoose.Schema(
  {
    emailAddress: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.inactive,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Add a virtual `id` field
adminSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

adminSchema.method("matchPassword", async function (password: string) {
  if (!this.password) {
    return false;
  }

  return await bcrypt.compare(password, this.password);
});

adminSchema.method("matchOTP", async function (otp: string) {
  const otpInDB = this.otp;
  const otpExpire = this.otpExpire as number;

  if (otpInDB === otp) {
    const currentTimestamp = Date.now();

    if (currentTimestamp > otpExpire) {
      return [false, "Otp has expired"];
    }

    // Unset the otp and otpExpire fields
    this.set("otp", undefined);
    this.set("otpExpire", undefined);

    await this.save();

    return [true, "Otp verified"];
  }

  return [false, "Otp does not match"];
});

adminSchema.method("generateOTP", async function () {
  const otp = generateRadomDigits(6);

  this.otp = otp;

  // Set expire
  this.otpExpire = Date.now() + 10 * 60 * 1000;

  // Save the updated OTP and expiration to the database
  await this.save();

  return otp;
});

adminSchema.set("toObject", { virtuals: true });

// Ensure virtual fields are included when converting Mongoose documents to JSON or Objects:
adminSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;

    return ret;
  },
});

adminSchema.method("verifyAccount", async function () {
  this.status = AccountStatus.active;

  await this.save();
});

export const AdminModel = mongoose.model<IAdmin, CustomAdminModel>(
  "Admin",
  adminSchema,
);
