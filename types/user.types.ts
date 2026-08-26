import { Model, Schema, model } from "mongoose";

export enum AccountStatus {
  active = "active",
  inactive = "inactive",
  suspended = "suspended",
  deactivated = "deactivated",
}

export interface IUser {
  firstName: String;
  lastName: String;
  password: String;
  emailAddress: String;
  username?: String;
  country?: String;
  localGovernment?: String;
  state?: String;
  address?: String;
  houseNumber?: String;
  status?: String;
  id?: String;
  _id?: String;
  token?: String;
  tokenExpire?: Number;
  otp?: String;
  otpExpire?: Number;
  phoneNumber?: String;
  dateOfBirth?: String;
  lintRefreshToken?: String;
  lintAccessToken?: String;
}

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateOTP(): Promise<string>; // Add this method signature
  generateToken(): Promise<string>; // Add this method signature
  verifyAccount(): Promise<string>; // Add this method signature
  matchOTP(otp: string): Promise<string>; // Add this method signature
  matchToken(token: string): Promise<string>; // Add this method signature
  suspendAccount(): Promise<void>; // Add this method signature
  deleteAcc(): Promise<void>; // Add this method signature
}

// Create a new model type that knows about IUserMethods
export type CustomUserModel = Model<IUser, {}, IUserMethods>;
