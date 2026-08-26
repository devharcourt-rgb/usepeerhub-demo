import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";
import { getCablePackageAmount, getUser } from "../../../utils/core.utils";
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

async function buyCableHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  const nellobytesClient = new NelloBytesClient();

  const { cableTv, packageId, smartCardNo, phoneNumber } = req.body;

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

    const apiResponse = await nellobytesClient.getCables();

    const amount =
      getCablePackageAmount(apiResponse, packageId, cableTv) || "0";

    const { balance } = await getBalanceForUser(userId);

    if (parseFloat(amount.toString()) * 100 > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    // check if nellybytes wallet has suffient balance
    const { balance: nellybytesBalance } = await nellobytesClient.getBalance();

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

    const response = await nellobytesClient.purchaseCable({
      CableTV: cableTv,
      SmartCardNo: smartCardNo,
      CallbackURL: "https://blowpay.app",
      PhoneNo: phoneNumber || user.phoneNumber,
      Package: packageId,
    });

    if (response.status !== "ORDER_RECEIVED") {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not complete transaction. Please try again later",
      );
    }

    // create a debit transaction
    await TransactionModel.create({
      user: userId,
      amount: parseFloat(amount) * 100,
      type: TransactionType.DEBIT,
      description: "CableTv purchase",
      status: TransactionStatus.COMPLETED,
      metadata: {
        ...response,
      },
    });

    return res.json({
      message: "Cable purchased successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default buyCableHandler;
