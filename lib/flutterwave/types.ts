export interface RegisterSubAccountDto {
  email: string;
  narration: string;
  bvn: string;
  is_permanent: boolean;
}
interface Business {
  notification: Notification;
  widget: Widget;
  transactionAlert: TransactionAlert;
  loginAlert: LoginAlert;
  spawnUrl: string;
  agreement: boolean;
  accountCreated: boolean;
  isVerified: boolean;
  tiers: string;
  walletBalance: number;
  escrowBalance: number;
  walletStatus: string;
  walletUpdatedAt: string;
  escrowUpdatedAt: string;
  verificationBvn: boolean;
  indemnity: boolean;
  idDoc: number;
  blocked: boolean;
  active: boolean;
  showBalance: boolean;
  timeCreated: string;
  usernameUpdatedAt: string;
  status: boolean;
  whoIs: number;
  transferBlock: boolean;
  accountBlock: boolean;
  mongoroBlock: boolean;
  deleted: boolean;
  subAccountType: number;
  document: number;
  accessKey: string;
  spawnToken: string;
  bid: number;
  businessName: string;
  directorFirstName: string;
  directorLastName: string;
  directorMiddleName: string;
  phone: string;
  email: string;
  password: string;
  walletTag: string;
  businessCategory: string;
  monthlyRevenue: string;
  country: string;
  city: string;
  state: string;
  gender: string;
  businessAddress: string;
  pin: string;
  setupComplete: boolean;
  dob: string;
  username: string;
  apiKey: string;
  token: string;
  lastLogin: string;
  emailCode: number;
  smsCode: number;
  updatedAt: string;
  createdAt: string;
}

interface Notification {
  message: string;
  subject: string;
  seen: boolean;
  sendAt: number | null;
}

interface Widget {
  message: string;
  subject: string;
  seen: boolean;
  sendAt: number;
}

interface TransactionAlert {
  notification: boolean;
  email: boolean;
  sms: boolean;
}

interface LoginAlert {
  notification: boolean;
  email: boolean;
}

interface SubAccount {
  detail: SubAccountDetail;
  data: SubAccountData;
}

interface SubAccountDetail {
  escrowBalance: number;
  escrowUpdatedAt: string;
  disabled: boolean;
  agreed: boolean;
  status: string;
  said: number;
  accountID: string;
  subAccountName: string;
  parentID: number;
  currency: string;
  inviteeID: number;
  updatedAt: string;
  createdAt: string;
}

interface SubAccountData {
  said: number;
  email: string | null;
  accountID: string;
  subAccountName: string;
  accountNumber: string;
  currency: string;
  image: string | null;
  phone: string | null;
  bankName: string;
  parentID: string;
  flwRef: string;
  inviteeID: string;
  escrowBalance: string;
  escrowUpdatedAt: string;
  disabled: boolean;
  agreed: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterSubAccountApiResponse {
  account_number: string;
  bank_name: string;
  flw_ref: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string; // ISO date string
  phone_number: string;
}

interface TransactionData {
  id: number;
  ip: string;
  amount: number;
  status: string;
  tx_ref: string;
  app_fee: number;
  flw_ref: string;
  currency: string;
  customer: Customer;
  narration: string;
  account_id: number;
  auth_model: string;
  created_at: string; // ISO date string
  merchant_fee: number;
  payment_type: string;
  charged_amount: number;
  device_fingerprint: string;
  processor_response: string;
}

export interface ChargeCompletedEvent {
  data: TransactionData;
  event: string;
}

export interface Balance {
  currency: string;
  available_balance: number;
  ledger_balance: number;
}

export type Balances = Array<Balance>;

export interface FetchAllBalancesResponse {
  status: string;
  message: string;
  data: Balances;
}
