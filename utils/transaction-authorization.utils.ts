import crypto from "node:crypto";
import redisConnection from "../config/redis";

const TOKEN_PREFIX = "txn-pin-auth:";

/** How long an authorization token stays valid before it must be re-requested. */
export const TRANSACTION_AUTHORIZATION_TOKEN_TTL_SECONDS = 120;

interface TransactionAuthorizationRecord {
  userId: string;
  action: string;
  payloadHash: string;
}

/** Recursively sorts object keys so the same logical payload always hashes the same way. */
function canonicalize(value: any): any {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = canonicalize(value[key]);
        return acc;
      }, {});
  }

  return value;
}

export function hashTransactionPayload(action: string, payload: unknown = {}) {
  const canonicalPayload = JSON.stringify(canonicalize(payload ?? {}));

  return crypto
    .createHash("sha256")
    .update(`${action}:${canonicalPayload}`)
    .digest("hex");
}

/**
 * Verifies a transaction pin was matched, then issues a short-lived, single-use
 * token bound to a specific `action` (an identifier for the transaction endpoint,
 * e.g. "bank-transfer") and `payload` (the transaction details it authorizes).
 *
 * The raw pin never needs to reach the actual transaction endpoint - only this
 * token does, and `consumeTransactionAuthorizationToken` rejects it if the
 * action or payload it's presented with don't match what was authorized.
 */
export async function createTransactionAuthorizationToken({
  userId,
  action,
  payload,
}: {
  userId: string;
  action: string;
  payload?: unknown;
}) {
  const token = crypto.randomBytes(32).toString("hex");

  const record: TransactionAuthorizationRecord = {
    userId,
    action,
    payloadHash: hashTransactionPayload(action, payload),
  };

  await redisConnection.set(
    `${TOKEN_PREFIX}${token}`,
    JSON.stringify(record),
    "EX",
    TRANSACTION_AUTHORIZATION_TOKEN_TTL_SECONDS,
  );

  return { token, expiresIn: TRANSACTION_AUTHORIZATION_TOKEN_TTL_SECONDS };
}

/**
 * Validates and, if valid, immediately deletes (single-use) a transaction
 * authorization token. Use this from the middleware guarding the actual
 * transaction endpoint - see `middlewares/transaction-pin.ts`.
 */
export async function consumeTransactionAuthorizationToken({
  token,
  userId,
  action,
  payload,
}: {
  token: string | undefined;
  userId: string;
  action: string;
  payload?: unknown;
}): Promise<{ valid: boolean; message?: string }> {
  if (!token) {
    return {
      valid: false,
      message: "Transaction authorization token is required",
    };
  }

  const key = `${TOKEN_PREFIX}${token}`;
  const raw = await redisConnection.get(key);

  if (!raw) {
    return {
      valid: false,
      message: "Transaction authorization token is invalid or has expired",
    };
  }

  // Single use: remove immediately so a captured/replayed token can't be reused.
  await redisConnection.del(key);

  const record: TransactionAuthorizationRecord = JSON.parse(raw);

  if (record.userId !== userId) {
    return {
      valid: false,
      message: "Transaction authorization token is invalid",
    };
  }

  if (record.action !== action) {
    return {
      valid: false,
      message: "Transaction authorization token is not valid for this action",
    };
  }

  const expectedHash = hashTransactionPayload(action, payload);

  if (record.payloadHash !== expectedHash) {
    return {
      valid: false,
      message: "Transaction details do not match the authorized request",
    };
  }

  return { valid: true };
}
