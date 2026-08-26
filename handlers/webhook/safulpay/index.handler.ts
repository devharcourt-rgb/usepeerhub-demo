import { NextFunction, Request, Response } from "express";
import { SafulPayWebhookModel } from "../../../models/safulpay-webhooks";
import { SafulPayWebhookEvent, SafulPayWebhookType } from "./interfaces";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import crypto from "crypto";
import { SafulPayWebhookLogModel } from "../../../models/sp.model";
import { CurrencyModel } from "../../../models/currency.model";

export async function safulpayWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Hook received");

  const secret = process.env.SAFUL_PAY_WEBHOOK_SECRET || "";
  const signatureHeader = req.headers["safulpay-signature"] as
    | string
    | undefined;

  if (!signatureHeader) {
    return res.status(401).send("Missing signature");
  }

  try {
    // Handle both raw buffer and parsed object cases
    let webhook: SafulPayWebhookEvent;
    let rawBody: string;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
      webhook = JSON.parse(rawBody);
    } else {
      webhook = req.body;
      rawBody = JSON.stringify(req.body);
    }
    SafulPayWebhookLogModel.create(webhook).catch((err) => {
      console.error("Error logging webhook:", err);
    });
    if (!webhook.webhook_id || !webhook.webhook_type || !webhook.data) {
      return res.status(400).send("Invalid webhook payload");
    }

    // ---- Parse signature header: t=timestamp,v1=signature ----
    const parts = signatureHeader.split(",");
    let timestamp: string | undefined;
    let providedSignature: string | undefined;

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "t") timestamp = value;
      if (key === "v1") providedSignature = value;
    }

    if (!providedSignature) {
      return res.status(401).send("Invalid signature format");
    }

    // ---- Compute expected signature ----
    // Most likely just rawBody, but check docs:
    let signingPayload = rawBody;

    // If docs say "timestamp + '.' + body", uncomment:
    // if (timestamp) {
    //   signingPayload = `${timestamp}.${rawBody}`;
    // }

    const computed = crypto
      .createHmac("sha256", secret)
      .update(signingPayload, "utf8")
      .digest("hex");

    // if (
    //   !crypto.timingSafeEqual(
    //     Buffer.from(providedSignature, "hex"),
    //     Buffer.from(computed, "hex")
    //   )
    // ) {
    //   return res.status(401).send("Invalid signature");
    // }

    // ---- Deduplicate webhook ----
    const existingWebhook = await SafulPayWebhookModel.findOne({
      webhookId: webhook.webhook_id,
    });

    if (existingWebhook) {
      return res.send("Already processed");
    }

    // ---- Handle webhook types ----
    if (webhook.webhook_type === SafulPayWebhookType.COLLECTION_COMPLETED) {
      // const user = await UserModel.findOne({
      //   phoneNumber: webhook.data.customer_phone,
      // });

      const user = await UserModel.findOne({
        _id: webhook.data.metadata.order_id,
      });

      if (!user) {
        throw new HTTPException(
          HTTPStatus.BAD_REQUEST,
          "User with phone number not found"
        );
      }

      // prevent duplicate transaction
      const existingTransaction = await TransactionModel.findOne({
        "metadata.webhookId": webhook.webhook_id,
      });

      if (!existingTransaction) {
        const leoneCurrency = await CurrencyModel.findOne({ code: "SLE" });

        await TransactionModel.create({
          currency: leoneCurrency?._id,
          user: user.id,
          amount: webhook.data.amount * 100, // convert to cents/lowest unit
          status: TransactionStatus.COMPLETED,
          type: TransactionType.CREDIT,
          description: "Wallet funding",
          metadata: { webhookId: webhook.webhook_id },
        });
      }
    }

    if (webhook.webhook_type === SafulPayWebhookType.DISBURSMENT_COMPLETED) {
      //   const transaction = await TransactionModel.findOne({
      //     _id: webhook.data.metadata?.order_id,
      //   });
      //   if (!transaction) {
      //     throw new HTTPException(
      //       HTTPStatus.BAD_REQUEST,
      //       "Transaction with id not found"
      //     );
      //   }
      //   transaction.status = TransactionStatus.COMPLETED;
      //   await transaction.save();
      // }
      // // ---- Store webhook record ----
      // await SafulPayWebhookModel.create({
      //   webhookId: webhook.webhook_id,
      // });
    }

    return res.send("Ok");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).send("Webhook processing failed");
  }
}
