/**
 * Types for the Nomba API client.
 *
 * @see https://developer.nomba.com/docs/getting-started/authentication
 */

/**
 * Every Nomba endpoint replies with this envelope. `code` is the business
 * status: "00" on most endpoints, "200"/"201" on the v2 transfer endpoints.
 */
export interface NombaApiResponse<T = unknown> {
  code: string;
  description: string;
  data: T;
  /** Only sent by some v2 endpoints. */
  message?: string;
  /** Only sent by some v2 endpoints. */
  status?: boolean;
}

/** Payload returned by `POST /auth/token/issue`. */
export interface NombaTokenData {
  businessId: string;
  access_token: string;
  refresh_token: string;
  /** ISO-8601 timestamp. Tokens live for 30 minutes. */
  expiresAt: string;
}

export type NombaTokenResponse = NombaApiResponse<NombaTokenData>;

/** Credentials + endpoint the client talks to. Defaults come from the environment. */
export interface NombaConfig {
  clientId: string;
  clientSecret: string;
  accountId: string;
  baseUrl: string;
  /**
   * Seconds before `expiresAt` at which a cached token is treated as stale, so
   * an in-flight request never races the expiry. Defaults to 60.
   */
  expiryLeewaySeconds?: number;
}

export type NombaHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type NombaQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

export interface NombaRequestOptions {
  method?: NombaHttpMethod;
  /** Serialised as JSON unless it is already a string. */
  body?: unknown;
  /** Appended as a query string; `undefined`/`null` entries are dropped. */
  query?: NombaQuery;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip the Authorization header (used by the token endpoints themselves). */
  skipAuth?: boolean;
}

/** The cached half of a token response. */
export interface NombaCachedToken {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  expiresAt: number;
}

/**
 * Body for `POST /accounts/virtual`.
 *
 * @see https://developer.nomba.com/nomba-api-reference/virtual-accounts/create-virtual-account
 */
export interface CreateVirtualAccountDTO {
  /** Your own reference for the account. 16-64 characters, must be unique. */
  accountRef: string;
  /** Name the account is created under. 8-64 characters. */
  accountName: string;
  /** Bank Verification Number of the account holder. */
  bvn?: string;
  /** When the account should stop accepting funds, as `YYYY-MM-DD HH:mm:ss`. */
  expiryDate?: string;
  /** Amount the account is expected to receive. */
  expectedAmount?: number;
  /** Per-account webhook URL. Echoed back on the created account. */
  callbackUrl?: string;
}

/** A virtual account as returned by the create/read virtual account endpoints. */
export interface NombaVirtualAccount {
  createdAt: string;
  accountHolderId: string;
  accountRef: string;
  bvn: string | null;
  accountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  currency: string;
  callbackUrl: string | null;
  expired: boolean;
}

export type CreateVirtualAccountResponse =
  NombaApiResponse<NombaVirtualAccount>;

/**
 * A bank as returned by `GET /transfers/banks`.
 *
 * @see https://developer.nomba.com/nomba-api-reference/transfers/fetch-bank-codes-and-names
 */
export interface NombaBank {
  /** The bank's code, 3-6 characters. This is what transfers and lookups take. */
  code: string;
  name: string;
  /** The bank's NIP institution code. May be null. */
  nipCode: string | null;
  /** Logo URL, or an empty string when unavailable. */
  logo: string;
}

export type FetchBanksResponse = NombaApiResponse<NombaBank[]>;

/**
 * Body for `POST /transfers/bank/lookup`.
 *
 * @see https://developer.nomba.com/nomba-api-reference/transfers/perform-bank-account-lookup
 */
export interface BankAccountLookupDTO {
  /** The 10-digit account number to resolve. */
  accountNumber: string;
  /** Bank code from {@link NombaBank.code}, e.g. "053". */
  bankCode: string;
}

/** The resolved account holder behind an account number. */
export interface NombaBankAccount {
  accountNumber: string;
  accountName: string;
}

export type BankAccountLookupResponse = NombaApiResponse<NombaBankAccount>;

/**
 * Body for `POST /v2/transfers/bank`.
 *
 * @see https://developer.nomba.com/nomba-api-reference/transfers/perform-bank-account-transfer-from-the-parent-account
 */
export interface BankTransferDTO {
  /** Amount to send, in the major currency unit (naira, not kobo). */
  amount: number;
  /** Destination account number, exactly 10 digits. */
  accountNumber: string;
  /** Name on the destination account, as returned by the lookup. */
  accountName: string;
  /** Recipient bank code from {@link NombaBank.code}. */
  bankCode: string;
  /**
   * Your own unique reference for this transfer. Nomba treats it as the
   * idempotency key, so it must be stable per transfer and never reused.
   */
  merchantTxRef: string;
  senderName?: string;
  narration?: string;
}

/**
 * Lifecycle of a transfer.
 *
 * - `SUCCESS` — settled.
 * - `PENDING_BILLING` — accepted but not final. The outcome arrives by webhook;
 *   do not retry.
 * - `REFUND` — failed, and the parent account was automatically refunded.
 */
export type NombaTransferStatus =
  | "SUCCESS"
  | "PENDING_BILLING"
  | "REFUND"
  | (string & {});

/** Transfer detail Nomba echoes back. Sparsely documented, so extras are allowed. */
export interface NombaTransferMeta {
  api_rrn?: string;
  narration?: string;
  recipientName?: string;
  sender_name?: string;
  merchantTxRef?: string;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
  sessionId?: string;
  amount_charged?: string | number;
  [key: string]: unknown;
}

/** A transfer as returned by `POST /v2/transfers/bank`. */
export interface NombaTransfer {
  /** Nomba's transfer id, e.g. `API-TRANSFER-C24AD-a6443bf0-...`. */
  id: string;
  type: string;
  status: NombaTransferStatus;
  /** Returned as a string, e.g. "1.0". */
  amount: string;
  fee: number;
  source: string;
  sourceUserId: string;
  customerBillerId: string;
  productId: string;
  timeCreated: string;
  meta: NombaTransferMeta;
}

export type BankTransferResponse = NombaApiResponse<NombaTransfer>;
