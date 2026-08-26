import { Model } from "mongoose";

export interface IPasscode {
  user: string;
  passcode: string;
}

export interface PasscodeMethods {
  matchPasscode(passcode: string): Promise<boolean>;
}

export type CustomPasscodeModel = Model<IPasscode, {}, PasscodeMethods>;
