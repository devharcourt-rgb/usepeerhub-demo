import { NextFunction, Request, Response } from "express";
import { detectFraud, getUser, logout } from "../../utils/core.utils";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getBalanceForUser } from "../../utils/virtual-account.util";
import { TransactionModel } from "../../models/transaction.model";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../../types/transaction.types";
import { FlutterwaveClient } from "../../lib/flutterwave";
import { ActivityLogModel } from "../../models/activity-log.model";
import { Activity } from "../../types/activity-log.types";
import { UserModel } from "../../models/user.model";
import { AccountStatus } from "../../types/user.types";
import { db } from "../../config/database";
import { getUserLock } from "../../utils/lock.utils";
import logger from "../../utils/logger.utils";

// Configuration constants
const MIN_TRANSACTION_AMOUNT = 50;
const MAX_TRANSACTION_AMOUNT = 1000000; // 1M NGN limit
const MAX_DECIMAL_PLACES = 2;

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

  // Check minimum amount
  if (parsedAmount < MIN_TRANSACTION_AMOUNT) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      `Amount must be at least ${MIN_TRANSACTION_AMOUNT} NGN`
    );
  }

  // Check maximum amount
  if (parsedAmount > MAX_TRANSACTION_AMOUNT) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      `Amount cannot exceed ${MAX_TRANSACTION_AMOUNT.toLocaleString()} NGN`
    );
  }

  // Check decimal places
  const decimalPlaces = (parsedAmount.toString().split(".")[1] || "").length;
  if (decimalPlaces > MAX_DECIMAL_PLACES) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      `Amount cannot have more than ${MAX_DECIMAL_PLACES} decimal places`
    );
  }

  return parsedAmount;
}

/**
 * Validates bill payment request parameters
 */
function validateBillPaymentRequest(body: any) {
  const { customerId, itemCode, billerCode, description } = body;

  if (!itemCode || typeof itemCode !== "string") {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Valid item code is required"
    );
  }

  if (!billerCode || typeof billerCode !== "string") {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Valid biller code is required"
    );
  }

  if (
    !description ||
    !Object.values(TransactionDescription).includes(description)
  ) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Valid transaction description is required"
    );
  }

  // Optional validation for customerId if provided
  if (
    customerId &&
    (typeof customerId !== "string" || customerId.trim().length === 0)
  ) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Customer ID must be a valid string if provided"
    );
  }
}

/**
 * Safely gets Flutterwave NGN balance with proper error handling
 */
async function getFlutterwaveNGNBalance(
  flwClient: FlutterwaveClient
): Promise<number> {
  try {
    const flwBalancesResponse = await flwClient.fetchAllBalances();

    if (flwBalancesResponse.status !== "success") {
      logger.error("Flutterwave balance fetch failed", {
        response: flwBalancesResponse,
      });
      throw new HTTPException(
        HTTPStatus.SERVICE_UNAVAILABLE,
        "Unable to verify service availability. Please try again later"
      );
    }

    const flwBalanceInNaira = flwBalancesResponse.data?.find(
      (balance) => balance.currency === "NGN"
    );

    if (!flwBalanceInNaira) {
      logger.error("NGN balance not found in Flutterwave response", {
        availableBalances: flwBalancesResponse.data?.map((b) => b.currency),
      });
      throw new HTTPException(
        HTTPStatus.SERVICE_UNAVAILABLE,
        "Service temporarily unavailable. Please try again later"
      );
    }

    return flwBalanceInNaira.available_balance;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(
      HTTPStatus.SERVICE_UNAVAILABLE,
      "Service temporarily unavailable. Please try again later"
    );
  }
}

/**
 * Handles fraud detection with proper flow control
 */
export async function handleFraudDetection(
  userId: string,
  req: Request,
  res: Response
): Promise<void> {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const cleanIP = ip!.replace("::ffff:", ""); // IPv4 compatibility

    const isFraudulent = await detectFraud(userId, cleanIP);

    if (isFraudulent) {
      logger.warn("Fraudulent activity detected", {
        userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      // Suspend the user account
      await UserModel.findByIdAndUpdate(userId, {
        status: AccountStatus.suspended,
        suspensionReason: "Fraudulent activity detected during bill payment",
        suspendedAt: new Date(),
      });

      // Log the suspension
      await ActivityLogModel.create({
        user: userId,
        action: Activity.ACCOUNT_SUSPENDED,
        metadata: { reason: "fraud_detection", context: "bill_payment" },
      });

      // Logout the user
      logout(req, res);

      throw new HTTPException(
        HTTPStatus.FORBIDDEN,
        "Account suspended due to suspicious activity. Please contact support"
      );
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    // Don't block transaction for fraud detection errors, but log them
    logger.warn("Proceeding with transaction despite fraud detection error", {
      userId,
    });
  }
}

/**
 * Creates bill payment with Flutterwave with proper error handling
 */
async function createFlutterwaveBillPayment(
  flwClient: FlutterwaveClient,
  amount: number,
  customerId: string | undefined,
  itemCode: string,
  billerCode: string
) {
  try {
    const flwClientResponse = await flwClient.createBillPayment({
      ...(customerId ? { customer_id: customerId } : {}),
      payload: {
        country: "NG",
        amount: parseInt(amount.toString()),
        customer_id: customerId!.toString(),
      },
      itemCode,
      billerCode,
    });

    return flwClientResponse;
  } catch (error) {
    logger.error("Flutterwave bill payment creation failed", {
      amount,
      itemCode,
      billerCode,
    });
    throw new HTTPException(
      HTTPStatus.SERVICE_UNAVAILABLE,
      "Unable to process bill payment. Please try again later"
    );
  }
}

async function createBillOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await db.startSession();
  const { userId } = getUser(req);
  const lock = getUserLock(userId);

  const startTime = Date.now();
  let transactionId: string | null = null;

  logger.info("Bill payment request initiated", {
    userId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  await lock.runExclusive(async () => {
    try {
      // Input validation
      const { amountEntered, customerId, itemCode, billerCode, description } =
        req.body;

      validateBillPaymentRequest(req.body);
      const parsedAmount = validateTransactionAmount(amountEntered);

      logger.info("Bill payment validation passed", {
        userId,
        amount: parsedAmount,
        itemCode,
        billerCode,
      });

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

      // Check Flutterwave service availability
      const flwClient = new FlutterwaveClient();

      const flwAvailableBalance = await getFlutterwaveNGNBalance(flwClient);

      if (parsedAmount > flwAvailableBalance) {
        logger.error("Insufficient Flutterwave balance", {
          requestedAmount: parsedAmount,
          flwBalance: flwAvailableBalance,
        });

        throw new HTTPException(
          HTTPStatus.SERVICE_UNAVAILABLE,
          "Service temporarily unavailable. Please try again later"
        );
      }

      // Fraud detection
      await handleFraudDetection(userId, req, res);

      // Create transaction record with PROCESSING status
      const tx = await TransactionModel.create({
        user: userId,
        amount: Math.round(parsedAmount * 100), // Store in kobo/cents
        type: TransactionType.DEBIT,
        description,
        status: TransactionStatus.PROCESSING,
        createdAt: new Date(),
      });

      transactionId = tx.id.toString();

      logger.info("Transaction created", {
        userId,
        transactionId,
        amount: parsedAmount,
      });

      logger.info("User balance debited", {
        userId,
        transactionId,
        debitAmount: parsedAmount,
      });

      // Create bill payment with Flutterwave
      const flwClientResponse = await createFlutterwaveBillPayment(
        flwClient,
        parsedAmount,
        customerId,
        itemCode,
        billerCode
      );

      // Update transaction based on Flutterwave response
      let finalStatus: TransactionStatus;

      if (flwClientResponse.status === "success") {
        finalStatus = TransactionStatus.COMPLETED;
      } else if (flwClientResponse.status === "pending") {
        finalStatus = TransactionStatus.PENDING;
      } else {
        finalStatus = TransactionStatus.FAILED;

        logger.warn("Bill payment failed, balance credited back", {
          userId,
          transactionId,
          flwResponse: flwClientResponse,
        });
      }

      // Update transaction with final status and metadata
      await TransactionModel.findByIdAndUpdate(tx.id, {
        status: finalStatus,
        metadata: flwClientResponse.data,
        completedAt: new Date(),
      });

      // Create activity log
      await ActivityLogModel.create({
        user: userId,
        action: Activity.BILL_PAYMENT,
        metadata: {
          transactionId: tx.id,
          amount: parsedAmount,
          status: finalStatus,
          billerCode,
          itemCode,
        },
      });

      // Commit transaction
      await session.commitTransaction();

      const processingTime = Date.now() - startTime;

      logger.info("Bill payment completed successfully", {
        userId,
        transactionId,
        status: finalStatus,
        processingTime,
      });

      // Return appropriate response based on status
      if (finalStatus === TransactionStatus.FAILED) {
        throw new HTTPException(
          HTTPStatus.BAD_REQUEST,
          "Bill payment failed. Your account has been credited back. Please try again"
        );
      }

      return res.json({
        message:
          finalStatus === TransactionStatus.COMPLETED
            ? "Bill payment completed successfully"
            : "Bill payment is being processed",
        status: flwClientResponse.status,
        transactionId: tx.id,
        data: {
          amount: parsedAmount,
          status: finalStatus,
          reference: flwClientResponse.data?.reference || null,
        },
      });
    } catch (error) {
      await session.abortTransaction();

      const processingTime = Date.now() - startTime;
      logger.error("Bill payment failed", {
        userId,
        transactionId,
        processingTime,
      });

      next(error);
    } finally {
      await session.endSession();
    }
  });
}

export default createBillOrderHandler;
