import { TransactionStatus } from "../../../../types/transaction.types";

export const getTransactionAnalyticsPipeline = () => {
  return [
    {
      $match: {
        $or: [
          { status: TransactionStatus.COMPLETED },
          { status: TransactionStatus.PROCESSING },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalNumberOfCredits: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, 1, 0],
          },
        },
        totalNumberOfDebits: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, 1, 0],
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalNumberOfCredits: 1,
        totalNumberOfDebits: 1,
        count: 1,
      },
    },
  ];
};
