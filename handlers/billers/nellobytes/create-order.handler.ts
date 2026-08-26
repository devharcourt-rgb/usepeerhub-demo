import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import { getBalanceForUser } from "../../../utils/virtual-account.util";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { ROOT_USER } from "../../../auto/constant";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";

async function buyElectricityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  const nellobytesClient = new NelloBytesClient();
  const { electricCompany, meterNo, meterType, amount, phoneNumber } = req.body;

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

    if (parseFloat(amount) < 1000) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Amount should be greater than 1000",
      );
    }

    const { balance } = await getBalanceForUser(userId);

    if (parseFloat(amount) * 100 > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    const { balance: nellybytesBalance } = await nellobytesClient.getBalance();

    // check if nellybytes wallet has suffient balance
    if (
      parseFloat(amount) > parseFloat(nellybytesBalance.replaceAll(",", ""))
    ) {
      // send email notification to admin to topup
      queueProducer.addJob({
        name: "send-admin-electricity-topup-email",
        data: {
          recipientEmail: ROOT_USER.emailAddress,
        },
      });

      throw new HTTPException(
        HTTPStatus.SERVICE_UNAVAILABLE,
        "Could not complete transaction. Please try again later",
      );
    }

    const response = await nellobytesClient.purchaseElectricity({
      ElectricCompany: electricCompany,
      MeterNo: meterNo,
      CallbackURL: "https://blowpay.app",
      PhoneNo: phoneNumber || user!.phoneNumber!.toString(),
      MeterType: meterType.toString(),
      Amount: amount.toString(),
    });

    if (response.status !== "ORDER_RECEIVED") {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not complete transaction. Please try again later",
      );
    }

    // create a debit transaction
    const transaction = await TransactionModel.create({
      user: userId,
      amount: parseFloat(amount) * 100,
      type: TransactionType.DEBIT,
      description: "Electricity purchase",
      status: TransactionStatus.COMPLETED,
      metadata: {
        token: response.metertoken,
        meterno: response.meterno,
        orderId: response.transactionid,
      },
    });

    const { orderId } = transaction.metadata;

    const { metertoken } = await nellobytesClient.getToken({
      OrderID: orderId,
    });

    // Add job to queue
    queueProducer.addJob({
      name: "send-disco-token-email",
      data: {
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
        token: metertoken,
      },
    });

    return res.json({
      message: "Electricity purchased successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default buyElectricityHandler;
