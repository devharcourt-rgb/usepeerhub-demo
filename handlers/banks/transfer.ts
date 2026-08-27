import { NextFunction, Request, Response } from "express";
import { detectFraud, getUser } from "../../utils/core.utils";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { VirtualAccountModel } from "../../models/virtual-account";
import { TransactionModel } from "../../models/transaction.model";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../../types/transaction.types";
import { AccountStatus } from "../../types/user.types";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";
import { ActivityLogModel } from "../../models/activity-log.model";
import { Activity } from "../../types/activity-log.types";
import logger from "../../utils/logger.utils";
import { CurrencyModel } from "../../models/currency.model";
import { BankService } from "../../services/bank.service";
import { VirtualAccountService } from "../../services/virtualAccount.service";

const bankService = new BankService();

async function transferHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { amount, accountNumber, accountName, bankCode } = req.body;

  const session = await VirtualAccountModel.startSession();
  const virtualAccountService = new VirtualAccountService();

  try {
    session.startTransaction();

    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    const amountInKobo = Number(amount) * 100;

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

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
      });

      // Log the suspension
      await ActivityLogModel.create({
        user: userId,
        action: Activity.ACCOUNT_SUSPENDED,
        metadata: { reason: "fraud_detection", context: "transfer" },
      });

      throw new HTTPException(
        HTTPStatus.FORBIDDEN,
        "Account suspended due to suspicious activity. Please contact support",
      );
    }

    const user = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Sender account not found",
      );
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Your account is not active. Please verify your account",
      );
    }

    const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        "Currency not found",
      );
    }

    const apiResponse = await bankService.initiateBankTransfer({
      amount,
      accountNumber,
      accountName,
      bankCode,
      senderName: `${user.firstName} ${user.lastName}`,
      narration: "Transfer from PeerHub",
    });

    // create a debit transaction
    await TransactionModel.create({
      amount: amountInKobo,
      type: TransactionType.DEBIT,
      currency: nigerianNaira._id,
      user: userId,
      description: TransactionDescription.TRANSFER,
      status: TransactionStatus.PENDING,
      metadata: {},
    });

    // create an activity log
    await ActivityLogModel.create({
      user: userId,
      action: Activity.TRANSFER,
    });

    await session.commitTransaction();

    return res.json({
      message: "Processing transfer",
      data: apiResponse,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
}

export default transferHandler;
