import { NextFunction, Request, Response } from "express";
import { db } from "../../../config/database";
import { getUserLock } from "../../../utils/lock.utils";
import logger from "../../../utils/logger.utils";
import { AccountStatus } from "../../../types/user.types";
import { getBalanceForUser } from "../../../utils/virtual-account.util";
import { SafulPayClient } from "../../../lib/safulpay";
import { handleFraudDetection } from "../createBillOrder.handler";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import {
  SafulPayBillCategory,
  SafulPayOutflowResponse,
} from "../../../lib/safulpay/interface";
import { ActivityLogModel } from "../../../models/activity-log.model";
import { Activity } from "../../../types/activity-log.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { CurrencyModel } from "../../../models/currency.model";

/**
 * Validates transaction amount with comprehensive checks
 */
function validateTransactionAmount(amountEntered: any): number {
  // Check if amount is provided
  if (
    amountEntered === undefined ||
    amountEntered === null ||
    amountEntered === ""
  ) {
    throw new HTTPException(HTTPStatus.BAD_REQUEST, "Amount is required");
  }

  const parsedAmount = parseFloat(amountEntered.toString());

  // Check for invalid numbers
  if (isNaN(parsedAmount)) {
    throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid amount format");
  }

  // Check for negative or zero amounts
  if (parsedAmount <= 0) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Amount must be greater than zero"
    );
  }

  return parsedAmount;
}

async function createSafulpayOutpayHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await db.startSession();
  const { userId } = getUser(req);
  const lock = getUserLock(userId);

  logger.info("Outflow payment request initiated", {
    userId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  await lock.runExclusive(async () => {
    try {
      const { amount, category, recipient, description } = req.body;

      const isValidCategory =
        Object.values(SafulPayBillCategory).includes(category);

      if (!isValidCategory) {
        throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid category");
      }

      const parsedAmount = validateTransactionAmount(amount);

      session.startTransaction();

      // Get user within transaction
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
      }

      if (user.status !== AccountStatus.active) {
        throw new HTTPException(
          HTTPStatus.FORBIDDEN,
          "Your account is not active. Please verify your account or contact support"
        );
      }

      // Check user balance within transaction
      const { balance } = await getBalanceForUser(userId);

      if (parsedAmount * 100 > balance) {
        logger.warn("Insufficient funds attempt", {
          userId,
          requestedAmount: parsedAmount,
          availableBalance: balance,
        });

        throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
      }

      const safulpayClient = new SafulPayClient();

      // Fraud detection
      await handleFraudDetection(userId, req, res);

      const leoneCurrency = await CurrencyModel.findOne({ code: "SLE" });

      // Create transaction record with PROCESSING status
      const tx = await TransactionModel.create({
        user: userId,
        amount: Math.round(parsedAmount * 100), // Store in kobo/cents
        type: TransactionType.DEBIT,
        description: "Bill Payment",
        status: TransactionStatus.PROCESSING,
        createdAt: new Date(),
        currency: leoneCurrency?._id,
      });

      // Create bill payment with Flutterwave
      const response = await safulpayClient.createOutflow({
        amount: parsedAmount,
        currency: "SLE",
        recipient_details: recipient,
        transaction_mode: category,
        description: description ?? `Bill payment for ${category}`,
        metadata: {
          order_id: tx.id,
        },
      });

      const { success, message } = response as SafulPayOutflowResponse;

      if (success !== true) {
        await TransactionModel.findByIdAndUpdate(tx.id, {
          status: TransactionStatus.FAILED,
          completedAt: new Date(),
        });

        throw new HTTPException(HTTPStatus.BAD_REQUEST, message);
      }

      // Create activity log
      await ActivityLogModel.create({
        user: userId,
        action: Activity.BILL_PAYMENT,
        metadata: {
          transactionId: tx.id,
          amount: parsedAmount,
        },
      });

      // Commit transaction
      await session.commitTransaction();

      return res.json({
        message: "Outflow payment is being processed",
        data: {},
      });
    } catch (error) {
      await session.abortTransaction();

      next(error);
    } finally {
      await session.endSession();
    }
  });
}

export default createSafulpayOutpayHandler;
