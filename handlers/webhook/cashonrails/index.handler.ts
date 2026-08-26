import { NextFunction, Request, Response } from "express";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import { UserModel } from "../../../models/user.model";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { NotificationService } from "../../../utils/notification.utils";
import { CurrencyModel } from "../../../models/currency.model";

const notificationService = NotificationService.getInstance();

async function webhookHandler_(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { event, data } = req.body;

  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  console.log("Hook received cash on rails");

  try {
    const authHeader = req.headers.authorization;
    const secretHash = process.env.CASHONRAILS_SECRET_WEBHOOK;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).end();
      return;
    }

    const token = authHeader.split(" ")[1];

    if (secretHash !== token) {
      res.status(401).end();
      return;
    }

    if (event === "transaction") {
      const user = await UserModel.findOne({
        emailAddress: data.customerinfo.email,
      });

      if (!user) {
        return res.status(404).json({
          message: "user account not found",
        });
      }

      const nairaCurrency = await CurrencyModel.findOne({ code: "NGN" });

      await TransactionModel.create({
        type: TransactionType.CREDIT,
        amount: parseFloat(data.amount.toString()) * 100, // format to kobo,
        user: user.id,
        status: TransactionStatus.COMPLETED,
        description: TransactionDescription.WALLET_FUNDING,
        currency: nairaCurrency?._id,
      });

      await notificationService
        .sendToUser(
          user.id.toString(),
          "Deposit Successful",
          `Your BlowPay account has been successfully funded with ₦${Number(
            data.amount,
          ).toLocaleString()}`,
        )
        .catch((err) => {
          console.error("Unable to send push notification:", err);
        });

      // Add job to queue
      queueProducer.addJob({
        name: "send-credit-email",
        data: {
          recipientEmail: user.emailAddress,
          recipientFirstName: user.firstName,
          amount: data.amount.toLocaleString(),
          senderName: `${user.firstName} ${user.lastName}`,
        },
      });
    }

    res.send("Ok");
  } catch (error) {
    next(error);
  }
}

export default webhookHandler_;
