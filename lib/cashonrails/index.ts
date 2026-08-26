import {
  ApiResponse,
  BankListResponse,
  CreateCustomerDTO,
  CreateCustomerResponse,
  CreateReservedAccountDTO,
  TransferRequestDTO,
  TransferResponse,
} from "./interface";
import crypto from "crypto";
import fs from "fs";

export class CashOnRails {
  private static baseUrl = "https://mainapi.cashonrails.com/api/v1";

  /**
   * Creates a new customer on the CashOnRails platform.
   *
   * @param payload - The customer details to be created.
   * @returns Promise resolving to the created customer response.
   *
   * @example
   * ```ts
   * const payload: CreateCustomerDTO = {
   *   email: "johndoe@gmail.com",
   *   first_name: "John",
   *   last_name: "Doe",
   *   phone: "08012345678",
   * };
   *
   * const response = await CreateCustomer(payload);
   * console.log(response.data.customer_code);
   * ```
   */
  async CreateCustomer(
    payload: CreateCustomerDTO,
  ): Promise<CreateCustomerResponse> {
    try {
      const res = await fetch(`${CashOnRails.baseUrl}/customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to create customer: ${res.statusText}`);
      }

      const data: CreateCustomerResponse = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async ReadCustomer(customer_code: string): Promise<CreateCustomerResponse> {
    try {
      const res = await fetch(
        `${CashOnRails.baseUrl}/customer/${customer_code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
            "X-Encrypted-Payload": "false",
            "X-Encrypt-Response": "false",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to create customer: ${res.statusText}`);
      }

      const data: CreateCustomerResponse = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async ReservedAccount(payload: CreateReservedAccountDTO) {
    try {
      const res = await fetch(
        `${CashOnRails.baseUrl}/reserved_virtual_account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error(
          `Failed to Reserve Account for Customer: ${res.statusText}`,
        );
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async ReadVirtualAccount(id: string): Promise<any> {
    try {
      const res = await fetch(`${CashOnRails.baseUrl}/reserved_account/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          "X-Encrypted-Payload": "false",
          "X-Encrypt-Response": "false",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to Read Virtual Account: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GetBankList(
    currency = "NGN",
  ): Promise<ApiResponse<BankListResponse[]>> {
    try {
      const res = await fetch(`${CashOnRails.baseUrl}/bank_list/${currency}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          "X-Encrypted-Payload": "false",
          "X-Encrypt-Response": "false",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to Get Bank List: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GetTransferFee(
    amount: string,
    currency = "NGN",
  ): Promise<ApiResponse<number>> {
    try {
      const res = await fetch(`${CashOnRails.baseUrl}/payout_fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          "X-Encrypted-Payload": "false",
          "X-Encrypt-Response": "false",
        },
        body: JSON.stringify({ amount, currency }),
      });

      if (!res.ok) {
        throw new Error(`Failed to Get Transfer Fee: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async ValidateAccountName({
    account_number,
    bank_code,
    currency = "NGN",
  }: {
    account_number: string;
    bank_code: string;
    currency?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const res = await fetch(`${CashOnRails.baseUrl}/account_name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          "X-Encrypted-Payload": "false",
          "X-Encrypt-Response": "false",
        },
        body: JSON.stringify({ account_number, bank_code, currency }),
      });

      if (!res.ok) {
        throw new Error(`Failed to Validate Account Name: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async InitiateTransfer(
    body: TransferRequestDTO,
  ): Promise<ApiResponse<TransferResponse>> {
    try {
      const payload = JSON.stringify(body);

      const privateKey = fs.readFileSync("private.pem", "utf8");
      const signature = crypto
        .sign("RSA-SHA256", Buffer.from(payload), privateKey)
        .toString("base64");
      const hmacSignature = crypto
        .createHmac("sha512", process.env.CASHONRAILS_SECRET as string)
        .update(payload)
        .digest("hex");
      const res = await fetch(`${CashOnRails.baseUrl}/bank_transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
          "X-Encrypted-Payload": "false",
          "X-Encrypt-Response": "false",
          "X-Signature": signature,
          Signature: hmacSignature,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Failed to Initiate Transfer: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async ReadVirtualAccountProvider(): Promise<any> {
    try {
      const res = await fetch(
        `${CashOnRails.baseUrl}/get_reserved_account_providers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CASHONRAILS_SECRET as string}`,
            "X-Encrypted-Payload": "false",
            "X-Encrypt-Response": "false",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Failed to Read Virtual Account: ${res.statusText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
