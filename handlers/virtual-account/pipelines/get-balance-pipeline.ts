import mongoose from "mongoose";
import { TransactionStatus } from "../../../types/transaction.types";

export const getBalancePipeline = ({
  user,
}: {
  user: mongoose.Types.ObjectId;
}) => {
  return [
    {
      $match: {
        user: user,
        $or: [
          { status: TransactionStatus.COMPLETED },
          { status: TransactionStatus.PROCESSING },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalCredits: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
        totalDebits: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        balance: {
          $cond: [
            { $eq: ["$count", 0] },
            0,
            { $subtract: ["$totalCredits", "$totalDebits"] },
          ],
        },
      },
    },
  ];
};
