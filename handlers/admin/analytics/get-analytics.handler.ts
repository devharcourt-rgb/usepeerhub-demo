import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../../models/user.model";
import { TransactionModel } from "../../../models/transaction.model";
import { getTransactionAnalyticsPipeline } from "./pipelines/get-total-income.handler";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getAnalyticsHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const blowmoneyClient = new BlowMoneyClient();

    const blowmoneyAnalytics = await blowmoneyClient.getAnalytics();

    const totalBlowAppUsers = await UserModel.countDocuments();
    const totalBlowMoneyUsers = blowmoneyAnalytics.data.totalUsers;

    const aggregation = getTransactionAnalyticsPipeline();
    const analyticsDoc = await TransactionModel.aggregate(aggregation);
    const analytics = analyticsDoc[0];

    const totalBlowAppCredits = analytics.totalNumberOfCredits;
    const totalBlowMoneyCredits = blowmoneyAnalytics.data.totalNumberOfCredits;

    const totalBlowAppDebits = analytics.totalNumberOfDebits;
    const totalBlowMoneyDebits = blowmoneyAnalytics.data.totalNumberOfDebits;

    return res.json({
      message: "analytics fetched",
      data: {
        totalUsers: {
          blowApp: totalBlowAppUsers,
          blowMoney: totalBlowMoneyUsers,
        },
        totalCredits: {
          blowApp: totalBlowAppCredits,
          blowMoney: totalBlowMoneyCredits,
        },
        totalDebits: {
          blowApp: totalBlowAppDebits,
          blowMoney: totalBlowMoneyDebits,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getAnalyticsHandlerForAdmin;
