import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { TransactionModel } from "../../models/transaction.model";
import mongoose from "mongoose";
import moment from "moment";
import { transactionsAnalysisPipeline } from "./pipelines/transaction-analysis";

async function getTransactionsAnalysisHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req.query;

  const beginDate = moment().startOf("month").toDate();
  const endDate = moment().endOf("month").toDate();

  try {
    const aggregation = transactionsAnalysisPipeline({
      beginDate: beginDate,
      endDate: endDate,
      user: new mongoose.Types.ObjectId(user as string),
    });

    const transactions = await TransactionModel.aggregate(aggregation);

    const analysis = transactions.length
      ? transactions[0]
      : {
          totalIncoming: 0,
          totalOutgoing: 0,
        };
    return res.json({
      message: "Transaction analysis fetched",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

export default getTransactionsAnalysisHandler;
