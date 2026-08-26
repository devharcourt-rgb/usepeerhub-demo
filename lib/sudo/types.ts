export interface CreateCustomerInterface {
  type: SudoCustomerType;
  emailAddress?: string;
  name: string;
  phoneNumber: string;
  individual: IndividualInterface;
  status: SudoCustomerStatus;
  billingAddress: BillingAddressInterface;
}

export enum SudoCustomerType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
}

export enum SudoCustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IndividualInterface {
  firstName: string;
  lastName: string;
  dob: string;
}

export interface BillingAddressInterface {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface GetAccountsInterface {
  page?: number;
  limit?: number;
  currency?: string;
  type?: string;
}

export enum AccountType {
  SAVINGS = "Savings",
  CURRENT = "Current",
}

export interface CreateAccountInterface {
  currency: string;
  type: "account" | "wallet";
  accountType: AccountType;
  customerId: string;
}

export interface TransferInterface {
  debitAccountId: string;
  creditAccountId?: string; // required only for internal transfers
  beneficiaryBankCode?: string; // required only for external transfers
  beneficiaryAccountNumber?: string; // required only for external transfers
  amount: number;
  narration?: string;
}

interface CustomerData {
  business: string;
  type: "individual" | "business";
  name: string;
  phoneNumber: string;
  status: "active" | "inactive" | "suspended";
  individual?: IndividualInterface;
  billingAddress: BillingAddressInterface;
  isDeleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  _id: string;
  __v: number;
}

export interface CreateSudoCustomerResponse {
  statusCode: number;
  message: string;
  data: CustomerData;
}
