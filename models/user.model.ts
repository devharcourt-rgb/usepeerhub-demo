import mongoose, { Schema } from "mongoose";
import { AccountStatus, IUser, CustomUserModel } from "../types/user.types";
import bcrypt from "bcrypt";
import { generateRadomDigits } from "../utils/core.utils";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter a first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter a last name"],
    },
    username: {
      type: String,
      required: false,
      unique: true,
      default: undefined,
    },
    emailAddress: {
      type: String,
      required: [true, "Please enter an email address"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid Email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.inactive,
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    localGovernment: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    tokenExpire: {
      type: Number,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    otpExpire: {
      type: Number,
      required: false,
    },
    otp: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: undefined,
    },
    houseNumber: {
      type: String,
      required: false,
      default: undefined,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      default: undefined,
    },
    lintRefreshToken: {
      type: String,
      required: false,
      default: undefined,
    },
    lintAccessToken: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Add a virtual `id` field
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.method("matchPassword", async function (password: string) {
  return await bcrypt.compare(password, this.password);
});

userSchema.method("matchOTP", async function (otp: string) {
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

userSchema.method("generateOTP", async function () {
  const otp = generateRadomDigits(6);

  this.otp = otp;

  // Set expire
  this.otpExpire = Date.now() + 10 * 60 * 1000;

  // Save the updated OTP and expiration to the database
  await this.save();

  return otp;
});

userSchema.method("generateToken", async function () {
  const salt = await bcrypt.genSalt(10);
  const token = await bcrypt.hash(this.emailAddress, salt);

  // Set expire
  this.tokenExpire = Date.now() + 10 * 60 * 1000;
  this.token = token;

  await this.save();

  return token;
});

userSchema.method("matchToken", async function (token: string) {
  const tokenInDB = this.token;
  const tokenExpire = this.tokenExpire as number;

  if (tokenInDB === token) {
    const currentTimestamp = Date.now();

    if (currentTimestamp > tokenExpire) {
      return [false, "Token has expired"];
    }

    // Unset the otp and otpExpire fields
    this.set("token", undefined);
    this.set("tokenExpire", undefined);
    await this.save();

    return [true, "Token verified"];
  }

  return [false, "Token does not match"];
});

userSchema.set("toObject", { virtuals: true });

// Ensure virtual fields are included when converting Mongoose documents to JSON or Objects:
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;

    return ret;
  },
});

userSchema.method("verifyAccount", async function () {
  this.status = AccountStatus.active;

  await this.save();
});

userSchema.method("suspendAccount", async function () {
  this.status = AccountStatus.suspended;
});

userSchema.method("deleteAcc", async function () {
  await this.deleteOne();
});

export const UserModel = mongoose.model<IUser, CustomUserModel>(
  "User",
  userSchema,
);
