export interface SafulPayLoginDto {
  login: String;
  password: String;
}

export interface SafulPayLoginResponse {
  success: boolean;
  message: string;
  data: {
    merchant: SafulPayMerchant;
    access_token: string;
    token_type: string;
  };
  error: string | null;
}

interface SafulPayMerchant {
  id: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  username: string;
  email: string;
  country_code: string;
  mobile: string;
  vendor_type: string;
  master_id: number;
  agent_code: string;
  ref_by: number;
  balance: string;
  password: string;
  pin: string | null;
  image: string;
  address: Address;
  status: number;
  kv: number;
  kyc_data: KycData[];
  kyc_rejection_reason: string | null;
  ev: number;
  sv: number;
  profile_complete: number;
  ver_code: string | null;
  ver_code_send_at: string | null;
  ts: number;
  tv: number;
  tsc: string | null;
  ban_reason: string | null;
  public_api_key: string;
  secret_api_key: string;
  webhook_url: string;
  webhook_secret_key: string;
  remember_token: string | null;
  login_chance: number;
  created_at: string;
  updated_at: string;
  tier: number;
}

interface Address {
  country: string;
  address: string;
  state: string;
  zip: string;
  city: string;
}

interface KycData {
  name: string;
  type: "file" | "radio" | string;
  value: string;
}

export interface ConfigureSafulPayWebhookDto {
  webhook_url: String;
  webhook_secret: String;
}

export interface CreateSafulPayInflowDto {
  amount: number;
  currency: string;
  description?: string;
  customer_phone: string;
  session_duration_minutes?: number;
  metadata?: SafulPayTransactionMetadata;
}

interface SafulPayTransactionMetadata {
  order_id: string;
  customer_name?: string;
}

export interface SafulPayInflowResponse {
  success: boolean;
  message: string;
  data: InflowData;
  error: string | null;
}

interface InflowData {
  inflow_id: string;
  merchant_code: string;
  amount: number;
  currency: string;
  service_slug: string;
  ussd_code: string;
  expires_at: string;
  status: string;
  created_at: string;
}

export interface CreateSafulPayOutflowDto {
  amount: number;
  currency: string;
  recipient_details: string;
  description?: string;
  metadata?: {
    order_id: string;
  };
  transaction_mode?:
    | "Account Number"
    | "Mobile Money"
    | "Airtime"
    | "EDSA"
    | "DSTV";
}

export interface SafulPayOutflowResponse {
  success: boolean;
  message: string;
  data: OutflowData;
  error: string | null;
}

interface OutflowData {
  status: boolean;
  message: string;
  transaction_id: string;
  amount: number;
  charges: number;
  sender_post_balance: number;
  slug: string;
  detail: string;
  payout_processing_type: string;
  multi_sig: boolean;
  api_data: ApiData;
}

interface ApiData {
  data: ApiTransactionData;
  slug: string;
  success: boolean;
  trx_id: string;
}

interface ApiTransactionData {
  amount: number;
  custom_field: string;
  to: string;
}

export interface SafulPayTransactionStatusResponse {
  success: boolean;
  message: string;
  data: TransactionStatusData;
  error: string | null;
}

interface TransactionStatusData {
  transaction_id: string;
  amount: string;
  currency: string;
  status: "Successful" | "Pending" | "Cancelled" | string;
  status_code: number;
  transaction_type: "Debit" | "Credit" | string;
  details: string;
  recipient_details: string;
  created_at: string;
  updated_at: string;
}

export interface SafulPayConfigureWebhookResponse {
  success: boolean;
  message: string;
  data: any;
  error: string | null;
}

export interface VerifySafulPayOutflowDto {
  amount?: number;
  recipient_details?: string;
  phone_number?: string;
  transaction_mode:
    | "Account Number"
    | "Mobile Money"
    | "Airtime"
    | "EDSA"
    | "DSTV";
}

export interface SafulPayVerifyOutflowResponse {
  success: boolean;
  message: string;
  data: any;
  error: string | null;
}

export enum SafulPayBillCategory {
  ACCOUNT = "Account Number",
  AIRTIME = "Airtime",
  EDSA = "EDSA",
  DSTV = "DSTV",
}
