import { NextFunction, Request, Response } from "express";
import { detectFraud, getUser } from "../../../utils/core.utils";
import { toLocalPhoneNo } from "../../../utils/formatter.utils";
import { UserModel } from "../../../models/user.model";
import { CurrencyModel } from "../../../models/currency.model";
import { TransactionModel } from "../../../models/transaction.model";
import { ActivityLogModel } from "../../../models/activity-log.model";
import { Activity } from "../../../types/activity-log.types";
import { AccountStatus } from "../../../types/user.types";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import logger from "../../../utils/logger.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";
import { DataService } from "../../../services/data.service";
import { Telco } from "../../../lib/nomba/type";

const virtualAccountService = new VirtualAccountService();
const dataService = new DataService();

async function vendDataHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { telco, productId, phoneNumber } = req.body as {
    telco: Telco;
    productId: string;
    phoneNumber: string;
  };

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Your account is not active. Please verify your account",
      );
    }

    const plan = await dataService.findDataPlan(telco, productId);

    if (!plan) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Data plan not found");
    }

    const amountInKobo = plan.amount * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

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

      await UserModel.findByIdAndUpdate(userId, {
        status: AccountStatus.suspended,
      });

      await ActivityLogModel.create({
        user: userId,
        action: Activity.ACCOUNT_SUSPENDED,
        metadata: { reason: "fraud_detection", context: "data" },
      });

      throw new HTTPException(
        HTTPStatus.FORBIDDEN,
        "Account suspended due to suspicious activity. Please contact support",
      );
    }

    const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        "Currency not found",
      );
    }

    const localPhoneNumber = toLocalPhoneNo(phoneNumber);

    // Created PENDING — Nomba's data purchase is asynchronous, so this only
    // moves to COMPLETED/FAILED once the webhook confirms the outcome.
    const transaction = await TransactionModel.create({
      user: userId,
      amount: amountInKobo,
      type: TransactionType.DEBIT,
      description: TransactionDescription.DATA,
      status: TransactionStatus.PENDING,
      currency: nigerianNaira._id,
      metadata: { phoneNumber: localPhoneNumber, telco, productId, plan },
    });

    const merchantTxRef = `data-${transaction._id.toString()}`;

    try {
      const nombaResponse = await dataService.purchaseDataBundle({
        telco,
        productId,
        phoneNumber: localPhoneNumber,
        merchantTxRef,
        senderName: `${user.firstName} ${user.lastName}`,
      });

      transaction.metadata = {
        ...transaction.metadata,
        merchantTxRef,
        nomba: nombaResponse,
      };
      await transaction.save();
    } catch (providerError) {
      transaction.status = TransactionStatus.FAILED;
      transaction.metadata = {
        ...transaction.metadata,
        merchantTxRef,
        error:
          providerError instanceof Error
            ? providerError.message
            : "Unknown provider error",
      };
      await transaction.save();

      throw providerError;
    }

    await ActivityLogModel.create({
      user: userId,
      action: Activity.BILL_PAYMENT,
    });

    return res.status(HTTPStatus.ACCEPTED).json({
      message: "Data purchase is processing",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export default vendDataHandler;
