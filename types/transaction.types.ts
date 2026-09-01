export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum TransactionDescription {
  TRANSFER = "Transfer",
  BILL_ORDER = "Bill Order",
  WALLET_FUNDING = "Wallet Funding",
  AIRTIME = "Airtime",
  DATA = "Data",
  CABLE = "Cable",
  ELECTRICITY = "Electricity",
  CRYPTO_DEPOSIT = "Crypto Deposit",
  OTHER = "Other",
  FLIGHT = "Flight",
}

export interface ITransaction {
  user: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  description?: TransactionDescription;
  metadata?: any;
  flagged?: boolean;
  flaggedBy?: string;
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  PROCESSING = "processing",
}
