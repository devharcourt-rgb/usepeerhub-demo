import { Model } from "mongoose";

export enum Activity {
  LOGIN = "login",
  BILL_PAYMENT = "bill_payment",
  TRANSFER = "transfer",
  ACCOUNT_SUSPENDED = "account_suspended",
}

export interface IActivityLog {
  user: string;
  action: Activity;
}

export interface IActivityLogMethods {
  detectFraud(): Promise<string>;
}

export type CustomActivityLog = Model<IActivityLog, {}, IActivityLogMethods>;
