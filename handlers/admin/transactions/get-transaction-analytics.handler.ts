import { NextFunction, Request, Response } from "express";
import { TransactionModel } from "../../../models/transaction.model";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import { UserModel } from "../../../models/user.model";
import { getTransactionAnalyticsPipeline } from "./pipeline/transaction-analytics.pipeline";
import mongoose from "mongoose";

async function getTransactionAnalyticsHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req.query;

  try {
    let transactionAnalytics;

    const isBlowpayUser = await UserModel.findById(user);

    if (isBlowpayUser) {
      const pipeline = getTransactionAnalyticsPipeline({
        user: new mongoose.Types.ObjectId(user!.toString()),
      });

      const analytics = await TransactionModel.aggregate(pipeline);

      transactionAnalytics = analytics.length ? analytics[0] : {};
    } else {
      const blowmoneyClient = new BlowMoneyClient();

      const response = await blowmoneyClient.getTransactionAnalytics(
        user!.toString()
      );

      transactionAnalytics = response.data;
    }

    return res.json({
      status: "transaction analytics fetched",
      data: transactionAnalytics,
    });
  } catch (error) {
    next(error);
  }
}

export default getTransactionAnalyticsHandlerForAdmin;
