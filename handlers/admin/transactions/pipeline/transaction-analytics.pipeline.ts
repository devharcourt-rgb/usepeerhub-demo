import mongoose from "mongoose";
import { TransactionStatus } from "../../../../types/transaction.types";

export const getTransactionAnalyticsPipeline = ({
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
        incoming: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
        outgoing: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        successful: {
          $sum: {
            $cond: [{ $eq: ["$status", TransactionStatus.COMPLETED] }, 1, 0],
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
            { $subtract: ["$incoming", "$outgoing"] }, // Fixed: using correct field names
          ],
        },
        outgoing: 1,
        incoming: 1,
        successful: 1,
      },
    },
  ];
};
