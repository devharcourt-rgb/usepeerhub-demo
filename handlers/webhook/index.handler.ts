import { NextFunction, Request, Response } from "express";
import { ChargeCompletedEvent } from "../../lib/flutterwave/types";
import { TransactionModel } from "../../models/transaction.model";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionType,
} from "../../types/transaction.types";
import { UserModel } from "../../models/user.model";
import { CurrencyModel } from "../../models/currency.model";
import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";
import { DEFAULT_CURRENCIES } from "../../auto/constant";
import { SafulPayWebhookLogModel } from "../../models/sp.model";

async function webhookHandler(req: Request, res: Response, next: NextFunction) {
  const { event, data }: ChargeCompletedEvent = req.body;
  const secret = process.env.SECRET_KEY as string;
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  console.log("Hook received");

  // Log Raw Require
  SafulPayWebhookLogModel.create({
    source: "Fluttwerwave",
    event,
    data,
  }).catch((err) => {
    console.log("Error in Webhook flutterwave preflight ==>", err);
  });

  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== secretHash) {
      // This request isn't from Flutterwave; discard
      res.status(401).end();
    }

    if (event === "charge.completed") {
      const user = await UserModel.findOne({
        emailAddress: data.customer.email,
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

export default webhookHandler;
