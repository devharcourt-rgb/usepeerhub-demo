import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import { detectFraud, getUser, logout } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import { getBalanceForUser } from "../../../utils/virtual-account.util";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import { ROOT_USER } from "../../../auto/constant";
import { ActivityLogModel } from "../../../models/activity-log.model";
import { Activity } from "../../../types/activity-log.types";
import { toLocalPhoneNo } from "../../../utils/formatter.utils";
import { smsService } from "../../../services/sms.service";
import { updateTransaction } from "../../../utils/transaction.utils";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { NotificationService } from "../../../utils/notification.utils";
import { CurrencyModel } from "../../../models/currency.model";

const notificationService = NotificationService.getInstance();

const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

async function vendElectricityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const buyPowerClient = new BuyPowerClient();
  const {
    meter,
    disco,
    amount,
    vendType = "PREPAID",
    vertical = "ELECTRICITY",
  } = req.body;
  const { userId } = getUser(req);

  try {
    const parsedAmount = parseFloat(amount);
    const parsedAmountInKobo = parsedAmount * 100;

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

    if (parsedAmount < 50) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Amount should be greater than 50",
      );
    }

    const { balance } = await getBalanceForUser(userId);

    if (parsedAmountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    const buyPowerWallet = await buyPowerClient.getWalletBalance();

    /**Converts buy power wallet balance to kobo */
    if (parsedAmountInKobo > buyPowerWallet.balance * 100) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Error processing request. Please try again later",
      );
    }
    const ip = req.ip || req.connection.remoteAddress;
    const cleanIP = ip!.replace("::ffff:", ""); // IPv4 compatibility

    const isFraudulent = await detectFraud(userId, cleanIP);

    if (isFraudulent) {
      const user = await UserModel.findById(userId);
      user?.suspendAccount();

      logout(req, res);
    }

    const nairaCurrency = await CurrencyModel.findOne({ code: "NGN" });

    // create a debit transaction with a status of processing
    const tx = await TransactionModel.create({
      user: userId,
      amount: parsedAmount * 100,
      type: TransactionType.DEBIT,
      description: "Electricity",
      status: TransactionStatus.PROCESSING,
      currency: nairaCurrency?._id,
    });

    const req_phone = toLocalPhoneNo(
      (user.phoneNumber as string) || ROOT_USER.phoneBP,
    );

    const response = await buyPowerClient.vendElectricity({
      meter,
      disco,
      vendType,
      vertical,
      amount: parsedAmount,
      orderId: tx._id.toString(),
      phone: req_phone,
      paymentType: "ONLINE",
    });

    if (!response.status) {
      const state = updateTransaction(response);
      tx.status = state.status;
      await tx.save();
      if (state.retry) {
        queueProducer.addJob({
          name: "auto-requery-bp",
          data: {
            transactionId: tx._id.toString(),
            retryCount: 0,
            state,
          },
          delay: 30000,
          jobId: `requery:${tx._id.toString()}-${Date.now()}`,
        });
      }
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: response?.message,
        data: {
          transaction: tx,
        },
        transaction_state: state,
      });
    }

    tx.status = TransactionStatus.COMPLETED;

    // add metadata to the transaction
    tx.metadata = response.data;
    await tx.save();
    // creates activity log
    await ActivityLogModel.create({
      user: userId,
      action: Activity.BILL_PAYMENT,
    });

    const body = `Thank you for your purchase! 🎉\nHere is your token: ${response.data.token}`;
    smsService(req_phone, body).catch((err) => {
      console.log(err);
    });
    await notificationService
      .sendToUser(
        user._id.toString(),
        "Your Power is Ready",
        `Thank you for your purchase! 🎉\nHere is your token: ${response.data.token}`,
      )
      .catch((err) => {
        console.error("Unable to send push notification:", err);
      });
    return res.status(HTTPStatus.OK).json({
      message: "Electricity purchased successfully",
      data: { ...response.data, transaction: tx },
      transaction_state: {
        status: TransactionStatus.COMPLETED,
        retry: false,
        TTR: 0,
        reason: "Vend Successful",
      },
    });
  } catch (error) {
    console.log("vend Error", error);
    next(error);
  }
}

export default vendElectricityHandler;
