import crypto from "crypto";
import { NombaWebhookPayload } from "./type";

export interface NombaWebhookHeaders {
  signature: string | undefined;
  algorithm: string | undefined;
  version: string | undefined;
  timestamp: string | undefined;
}

/**
 * Verifies the `nomba-signature` header per
 * https://developer.nomba.com/docs/api-basics/webhook
 *
 * Nomba signs: event_type:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp
 * with HMAC-SHA256 (base64), where `timestamp` is the `nomba-timestamp` header value.
 */
export function verifyNombaWebhookSignature(
  payload: NombaWebhookPayload,
  headers: NombaWebhookHeaders,
  secret: string,
): boolean {
  if (!headers.signature || !headers.timestamp) {
    return false;
  }

  const merchant = payload.data?.merchant ?? {};
  const transaction = payload.data?.transaction ?? ({} as NombaWebhookPayload["data"]["transaction"]);

  const responseCode =
    !transaction.responseCode || transaction.responseCode === "null"
      ? ""
      : transaction.responseCode;

  const hashingPayload = [
    payload.event_type ?? "",
    payload.requestId ?? "",
    merchant.userId ?? "",
    merchant.walletId ?? "",
    transaction.transactionId ?? "",
    transaction.type ?? "",
    transaction.time ?? "",
    responseCode,
    headers.timestamp,
  ].join(":");

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(hashingPayload)
    .digest("base64");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(headers.signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}
