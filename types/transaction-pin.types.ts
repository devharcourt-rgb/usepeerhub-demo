import { Model } from "mongoose";

export interface ITransactionPin {
  user: string;
  pin: string;
}

export interface TransactionPinMethods {
  matchPin(pin: string): Promise<boolean>;
}

export type CustomTransactionPinModel = Model<
  ITransactionPin,
  {},
  TransactionPinMethods
>;
