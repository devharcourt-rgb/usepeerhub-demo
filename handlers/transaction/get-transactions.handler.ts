import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { TransactionModel } from "../../models/transaction.model";
import mongoose from "mongoose";

async function getTransactionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const {
    limit = 45,
    page = 1,
    sort = "createdAt:-1",
    description,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const [sortField, sortOrder] = (sort as string).split(":");
  const sortOptions: { [key: string]: 1 | -1 } = {
    [sortField]: sortOrder === "-1" ? -1 : 1,
  };

  const query: Record<string, any> = {};

  query.user = new mongoose.Types.ObjectId(userId);

  if (description) {
    query.description = description;
  }

  try {
    const transactions = await TransactionModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      message: "Transactions fetched successfully",
      data: {
        transactions,
        limit: Number(limit),
        page: Number(page),
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getTransactionsHandler;
