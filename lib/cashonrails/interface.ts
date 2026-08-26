export interface CreateCustomerDTO {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dob?: string | Date | number;
  bvn?: string;
  nin?: string;
}

export interface CustomerData {
  email: string;
  domain: string;
  customer_code: string;
  id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data: CustomerData;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BankListResponse {
  bank_code: string;
  bank_name: string;
  currency: string;
}

export interface CreateReservedAccountDTO {
  customer_code: string;
  provider: string;
  id: string;
}

export interface TransferRequestDTO {
  account_number: string;
  bank_code: string;
  amount: string;
  currency: string;
  sender_name: string;
  narration: string;
  reference: string;
}

export interface TransferResponse {
  transfer_id: string;
  reference: string;
  status: string;
}
