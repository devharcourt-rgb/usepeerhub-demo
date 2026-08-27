import { NextFunction, Request, Response } from "express";
import { TransactionModel } from "../../../models/transaction.model";
import { TransactionStatus } from "../../../types/transaction.types";
import { NombaWebhookPayload } from "../../../lib/nomba/type";
import { verifyNombaWebhookSignature } from "../../../lib/nomba/webhook";
import { NotificationService } from "../../../utils/notification.utils";

const notificationService = NotificationService.getInstance();

const SUCCESS_EVENTS = new Set(["payment_success", "payout_success"]);
const FAILURE_EVENTS = new Set(["payment_failed", "payout_failed"]);

/**
 * Reconciles PENDING transactions (e.g. an airtime vend) against Nomba's
 * async webhook. See https://developer.nomba.com/docs/api-basics/webhook
 */
async function nombaWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const payload = req.body as NombaWebhookPayload;

  console.log("Nomba webhook received:", payload?.event_type);

  try {
    const secret = process.env.NOMBA_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "NOMBA_WEBHOOK_SECRET is not configured — rejecting webhook",
      );
      return res.status(401).end();
    }

    const isValid = verifyNombaWebhookSignature(
      payload,
      {
        signature: req.headers["nomba-signature"] as string | undefined,
        algorithm: req.headers["nomba-signature-algorithm"] as
          | string
          | undefined,
        version: req.headers["nomba-signature-version"] as string | undefined,
        timestamp: req.headers["nomba-timestamp"] as string | undefined,
      },
      secret,
    );

    if (!isValid) {
      return res.status(401).end();
    }

    const merchantTxRef = payload.data?.transaction?.merchantTxRef;

    // Nothing of ours to reconcile (e.g. events unrelated to a merchantTxRef we issued).
    if (!merchantTxRef) {
      return res.send("Ok");
    }

    const transaction = await TransactionModel.findOne({
      "metadata.merchantTxRef": merchantTxRef,
    });

    // Nomba retries webhooks, and a transaction already reconciled (or
    // unknown to us) should be a no-op rather than reprocessed.
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      return res.send("Ok");
    }

    if (SUCCESS_EVENTS.has(payload.event_type)) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.metadata = { ...transaction.metadata, webhook: payload.data };
      await transaction.save();

      notificationService
        .sendToUser(
          transaction.user.toString(),
          "Purchase Successful",
          `Your ${transaction.description ?? "purchase"} was successful`,
        )
        .catch((err) => {
          console.error("Unable to send push notification:", err);
        });
    } else if (FAILURE_EVENTS.has(payload.event_type)) {
      transaction.status = TransactionStatus.FAILED;
      transaction.metadata = { ...transaction.metadata, webhook: payload.data };
      await transaction.save();
    }
    // Other event types (payment_reversal, payout_refund, ...) aren't
    // reconciled here yet — left as a no-op rather than guessed at.

    return res.send("Ok");
  } catch (error) {
    next(error);
  }
}

export default nombaWebhookHandler;
