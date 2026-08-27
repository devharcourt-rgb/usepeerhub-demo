import { NextFunction, Request, Response } from "express";
import { detectFraud, getUser } from "../../../utils/core.utils";
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
import { ElectricityService } from "../../../services/electricity.service";
import { MeterType } from "../../../lib/nomba/type";

const virtualAccountService = new VirtualAccountService();
const electricityService = new ElectricityService();

async function vendElectricityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { disco, customerId, meterType, amount } = req.body as {
    disco: string;
    customerId: string;
    meterType: MeterType;
    amount: number;
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

    const customerName = await electricityService.lookupCustomer(
      disco,
      customerId,
    );

    if (!customerName) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not resolve meter / customer number",
      );
    }

    const amountInKobo = Number(amount) * 100;
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
        metadata: { reason: "fraud_detection", context: "electricity" },
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

    // Created PENDING — even though Nomba's response can carry the prepaid
    // token synchronously, we only trust COMPLETED once the webhook
    // confirms it, same as the other billers.
    const transaction = await TransactionModel.create({
      user: userId,
      amount: amountInKobo,
      type: TransactionType.DEBIT,
      description: TransactionDescription.ELECTRICITY,
      status: TransactionStatus.PENDING,
      currency: nigerianNaira._id,
      metadata: { disco, customerId, meterType, customerName },
    });

    const merchantTxRef = `electricity-${transaction._id.toString()}`;

    try {
      const nombaResponse = await electricityService.payBill({
        disco,
        customerId,
        meterType,
        amount: Number(amount),
        payerName: `${user.firstName} ${user.lastName}`,
        merchantTxRef,
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
      message: "Electricity purchase is processing",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export default vendElectricityHandler;
