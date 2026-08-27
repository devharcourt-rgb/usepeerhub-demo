export interface ApiResponse<T> {
  code: string;
  description: string;
  data: T;
}

// A few endpoints' envelopes carry an extra `message` field alongside the
// usual code/description/data — unlike the rest of the API.
export type ApiResponseWithMessage<T> = ApiResponse<T> & { message: string };

export interface TokenResponse {
  businessId: string;
  access_token: string;
  refresh_token: string;
  expiresAt: string; // ISO 8601 UTC timestamp
}

export interface CreateVirtualAccountDto {
  accountRef: string; // 16-64 chars
  accountName: string; // 8-64 chars
  bvn?: string;
  expiryDate?: string; // e.g. "2026-01-30 12:15:00"
  expectedAmount?: number;
}

export interface Bank {
  code: string; // 3-6 chars
  name: string;
  nipCode: string | null;
  logo: string; // URL
}

export interface BankAccountLookupDto {
  accountNumber: string; // 10 chars
  bankCode: string; // e.g. "053"
}

export interface BankAccountLookupResponse {
  accountNumber: string;
  accountName: string;
}

export interface BankTransferDto {
  amount: number;
  accountNumber: string; // 10 digits — destination account
  accountName: string; // recipient name
  bankCode: string;
  merchantTxRef: string; // unique per transfer — used for idempotency
  senderName?: string;
  narration?: string;
}

export interface BankTransferData {
  amount: string;
  source: string;
  sourceUserId: string;
  customerBillerId: string;
  productId: string;
  meta: Record<string, unknown>;
  fee: number;
  timeCreated: string; // ISO 8601 timestamp
  id: string;
  type: string; // e.g. "withdrawal"
  // Returns synchronously as one of these two — later terminal states arrive via webhook.
  status: "SUCCESS" | "PENDING_BILLING";
}

// This endpoint's envelope carries `message` plus a top-level `status`
// boolean on top of the usual code/description/data.
export type BankTransferResponse = ApiResponseWithMessage<BankTransferData> & {
  status: boolean;
};

export type WalletTransferStatus =
  | "SUCCESS"
  | "PENDING_BILLING"
  | "REFUND"
  | "CANCELLED"
  | "PAYMENT_FAILED"
  | "REVERSED_BY_VENDOR";

export interface WalletTransferDto {
  amount: number;
  receiverAccountId: string; // UUID
  merchantTxRef: string; // unique per transfer — used for idempotency
  narration?: string;
}

export interface WalletTransferResponse {
  amount: number;
  fee: number;
  id: string;
  type: string; // e.g. "p2p"
  status: WalletTransferStatus;
  timeCreated: string; // ISO 8601 timestamp
  meta: {
    merchantTxRef: string;
    api_client_id: string;
    api_account_id: string;
    rrn: string;
  };
}

export type Telco = "mtn" | "glo" | "airtel" | "9mobile";

export interface DataPlan {
  amount: number; // int64
  plan: string;
  productId: string; // used to identify the plan when purchasing
}

export type AirtimeNetwork = "GLO" | "MTN" | "9MOBILE" | "AIRTEL";

export interface AirtimePurchaseDto {
  amount: number;
  phoneNumber: string; // 11-13 chars, e.g. "08055441122"
  network: AirtimeNetwork;
  merchantTxRef: string; // unique per purchase — used for idempotency
  senderName?: string;
}

export interface AirtimePurchaseResponse {
  amount: number;
  timeCreated: string; // ISO 8601 timestamp
  type: string; // e.g. "topup"
  meta: {
    merchantTxRef: string;
    rrn: string;
  };
  status: string; // e.g. "Processing"
}

export interface DataBundlePurchaseDto {
  productId: string; // from fetchDataPlans(), e.g. "mtn47"
  phoneNumber: string; // 11-13 chars, e.g. "08055441122"
  network: AirtimeNetwork;
  merchantTxRef: string; // unique per purchase — used for idempotency
  senderName?: string;
  /** @deprecated use productId instead */
  amount?: number;
}

export interface DataBundlePurchaseResponse {
  amount: number;
  productId: string;
  plan: string;
  timeCreated: string; // ISO 8601 timestamp
  type: string; // e.g. "topup"
  meta: {
    merchantTxRef: string;
    rrn: string;
  };
  status: string; // e.g. "Processing"
}

export interface ElectricityDisco {
  id: string; // e.g. "jed"
  name: string; // e.g. "Jos Electric (JEDC)"
}

export type MeterType = "prepaid" | "postpaid";

export interface ElectricityPaymentDto {
  disco: string; // ElectricityDisco.id, e.g. "jed"
  merchantTxRef: string; // unique per payment — used for idempotency
  payerName: string;
  amount: number;
  customerId: string; // meter/customer identifier
  meterType: MeterType;
}

export interface ElectricityPaymentResponse {
  amount: number;
  timeCreated: string; // ISO 8601 timestamp
  type: string; // e.g. "phcn"
  status: string; // e.g. "SUCCESS"
  id: string;
  fee: string;
  meta: {
    merchantTxRef: string;
    phcnVendToken: string;
    phcnVendUnits: string;
    meterType: string; // e.g. "PREPAID"
    meterName: string;
  };
}

// GET /v1/bill/cableTvProduct?cableTvType=dstv — note ShowMax is capitalized,
// unlike the other three values.
export type CableTvType = "dstv" | "gotv" | "startimes" | "ShowMax";

export interface CableTvProduct {
  // Field names aren't confirmed against a live response — modeled after
  // Nomba's other catalog endpoints (DataPlan, BettingProvider), which all
  // pair an id/code with a display name and a price.
  code?: string;
  productId?: string;
  name?: string;
  packageName?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface CableTvSubscriptionDto {
  cableTvType: CableTvType;
  merchantTxRef: string; // unique per subscription — used for idempotency
  payerName: string;
  amount: number;
  customerId: string; // smart card / IUC number
}

export interface CableTvSubscriptionResponse {
  amount: number;
  timeCreated: string; // ISO 8601 timestamp
  type: string;
  meta: Record<string, unknown>;
  status: string;
  id: string;
  fee: string;
}

export interface BettingProvider {
  lookup_id: string;
  amount: string;
  name: string;
  biller_id: string;
  id: string;
}

export type BettingProvidersResponse = ApiResponseWithMessage<BettingProvider[]>;

export interface BettingPaymentDto {
  bettingProvider: string; // e.g. "bet9ja"
  merchantTxRef: string; // unique per payment — used for idempotency
  phoneNumber: string;
  payerName: string;
  amount: number;
  customerId: string;
}

export interface BettingPaymentResponse {
  amount: number;
  timeCreated: string; // ISO 8601 timestamp
  type: string;
  status: string; // e.g. "SUCCESS"
  id: string;
  fee: string;
  meta: {
    merchantTxRef: string;
    rrn: string;
    api_client_id: string;
    api_account_id: string;
  };
}

export interface VirtualAccountDetailsResponse {
  createdAt: string; // ISO 8601 timestamp
  accountHolderId: string; // UUID
  accountRef: string;
  bvn: string;
  accountName: string;
  currency: string; // e.g. "NGN"
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  callbackUrl: string;
  expired: boolean;
}

// See https://developer.nomba.com/docs/api-basics/webhook
export type NombaWebhookEventType =
  | "payment_success"
  | "payout_success"
  | "payment_failed"
  | "payment_reversal"
  | "payout_failed"
  | "payout_refund";

export interface NombaWebhookMerchant {
  walletId?: string;
  walletBalance?: number;
  userId?: string;
}

export interface NombaWebhookTransaction {
  type: string; // e.g. "topup", "transfer", "purchase", "vact_transfer"
  transactionId: string;
  merchantTxRef?: string;
  responseCode?: string | null;
  time: string; // RFC-3339 timestamp — the value hashed into the signature
  transactionAmount: number;
  fee?: number;
  narration?: string;
  sessionId?: string;
  originatingFrom?: string;
  responseCodeMessage?: string;
  [key: string]: unknown;
}

export interface NombaWebhookPayload {
  event_type: NombaWebhookEventType;
  requestId: string;
  data: {
    merchant?: NombaWebhookMerchant;
    terminal?: Record<string, unknown>;
    transaction: NombaWebhookTransaction;
    customer?: Record<string, unknown>;
  };
}
