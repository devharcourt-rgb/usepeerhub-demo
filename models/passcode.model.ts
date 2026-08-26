import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { CustomPasscodeModel, IPasscode } from "../types/passcode.types";

const passcodeSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    passcode: {
      type: String,
      required: [true, "Passcode is required"],
    },
  },
  {
    timestamps: true,
  },
);

passcodeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

passcodeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id;
  },
});

passcodeSchema.set("toObject", {
  virtuals: true,
});

passcodeSchema.pre("save", async function (next) {
  if (!this.isModified("passcode")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.passcode = await bcrypt.hash(this.passcode, salt);
});

passcodeSchema.method("matchPasscode", async function (passcode: string) {
  const passcodeInDB = this.passcode as string;

  return await bcrypt.compare(passcode, passcodeInDB);
});

export const PasscodeModel = mongoose.model<IPasscode, CustomPasscodeModel>(
  "Passcode",
  passcodeSchema,
);
