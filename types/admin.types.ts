import { Model } from "mongoose";
import { AccountStatus } from "./user.types";
import { AdminRole } from "./role.types";

export interface IAdmin {
  firstName?: string;
  lastName?: string;
  emailAddress: string;
  password?: string;
  role: AdminRole;
  status: AccountStatus;
}

export interface IAdminMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateOTP(): Promise<string>; // Add this method signature
  generateToken(): Promise<string>; // Add this method signature
  verifyAccount(): Promise<string>; // Add this method signature
  matchOTP(otp: string): Promise<string>; // Add this method signature
  matchToken(token: string): Promise<string>; // Add this method signature
}

// Create a new model type that knows about IAdminMethods
export type CustomAdminModel = Model<IAdmin, {}, IAdminMethods>;
