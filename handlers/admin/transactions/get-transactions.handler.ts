import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { TransactionModel } from "../../../models/transaction.model";
import { HTTPStatus } from "../../../utils/http.utils";
import mongoose from "mongoose";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import { getTransactionsPipeline } from "./pipeline/get-transactions.pipeline";

// Enums and Types
export enum APP_NAME {
  BLOWPAY = "blowpay",
  BLOWMONEY = "blowmoney",
  BOTH = "both",
}

interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: string;
  user?: string;
  search?: string;
  app?: APP_NAME;
}

interface TransactionQuery {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  status?: string;
  amount?: {
    $gte?: number;
    $lte?: number;
  };
  user?: mongoose.Types.ObjectId;
}

interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

/**
 * Builds a query object for filtering transactions based on provided parameters
 */
function buildTransactionQuery(
  params: TransactionQueryParams
): TransactionQuery {
  const query: TransactionQuery = {};

  if (params.startDate) {
    query.createdAt = {
      ...query.createdAt,
      $gte: new Date(params.startDate),
    };
  }

  if (params.endDate) {
    query.createdAt = {
      ...query.createdAt,
      $lte: new Date(params.endDate),
    };
  }

  if (params.status) {
    query.status = params.status;
  }

  if (params.minAmount) {
    query.amount = {
      ...query.amount,
      $gte: Number(params.minAmount),
    };
  }

  if (params.maxAmount) {
    query.amount = {
      ...query.amount,
      $lte: Number(params.maxAmount),
    };
  }

  if (params.user) {
    query.user = new mongoose.Types.ObjectId(params.user);
  }

  return query;
}

/**
 * Parses sort parameter into field and order
 */
function parseSortOptions(sort: string = "createdBy:desc"): SortOptions {
  const [field, order] = sort.split(":");
  return {
    field,
    order: (order || "desc") as "asc" | "desc",
  };
}

/**
 * Fetches transactions from Blowpay database
 */
async function getBlowpayTransactions(
  query: TransactionQuery,
  sortOptions: SortOptions
) {
  const pipeline = getTransactionsPipeline({
    query,
    field: sortOptions.field,
    order: sortOptions.order,
  });
  return TransactionModel.aggregate(pipeline as []);
}

/**
 * Fetches transactions from Blowmoney API
 */
async function getBlowmoneyTransactions(query: TransactionQuery) {
  const client = new BlowMoneyClient();
  return client.getTransactions({ query });
}

/**
 * Main handler for fetching admin transactions
 */
async function getTransactionsHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getUser(req);
    const queryParams = req.query as TransactionQueryParams;
    const { app = APP_NAME.BOTH } = queryParams;

    // Validate admin permissions
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    const query = buildTransactionQuery(queryParams);
    const sortOptions = parseSortOptions(queryParams.sort || "createdAt:desc");
    let transactions = [];

    switch (app) {
      case APP_NAME.BLOWPAY:
        transactions = await getBlowpayTransactions(query, sortOptions);
        break;

      case APP_NAME.BLOWMONEY:
        let response = await getBlowmoneyTransactions(query);
        transactions = response.data;
        break;

      case APP_NAME.BOTH:
        const [blowpayTransactions, blowmoneyTransactions] = await Promise.all([
          getBlowpayTransactions(query, sortOptions),
          getBlowmoneyTransactions(query),
        ]);

        transactions = [];
        transactions.push(...blowmoneyTransactions.data);
        transactions.push(...blowpayTransactions);

        transactions = transactions.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        break;

      default:
        throw new Error(`Invalid app name: ${app}`);
    }

    res.status(HTTPStatus.OK).json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

export default getTransactionsHandlerForAdmin;
