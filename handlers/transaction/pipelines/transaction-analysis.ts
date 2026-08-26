import mongoose, { PipelineStage } from "mongoose";
import { TransactionType } from "../../../types/transaction.types";

export function transactionsAnalysisPipeline({
  beginDate,
  endDate,
  user,
}: {
  beginDate: Date;
  endDate: Date;
  user: mongoose.Types.ObjectId;
}): PipelineStage[] {
  return [
    {
      $match: {
        user: user,
        createdAt: {
          $gte: beginDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
          },
        },
        totalIncoming: {
          $sum: {
            $cond: {
              if: { $eq: ["$type", TransactionType.CREDIT] },
              then: "$amount",
              else: 0,
            },
          },
        },
        totalOutgoing: {
          $sum: {
            $cond: {
              if: { $eq: ["$type", TransactionType.DEBIT] },
              then: "$amount",
              else: 0,
            },
          },
        },
        balance: {
          $sum: {
            $cond: {
              if: { $eq: ["$type", TransactionType.CREDIT] },
              then: "$amount",
              else: { $multiply: ["$amount", -1] },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncoming: 1,
        totalOutgoing: 1,
        balance: 1,
      },
    },
  ];
}
