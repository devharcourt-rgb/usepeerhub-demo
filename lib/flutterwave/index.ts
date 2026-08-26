import {
  Balances,
  FetchAllBalancesResponse,
  RegisterSubAccountDto,
} from "./types";

export class FlutterwaveClient {
  static readonly baseUrl = "https://api.flutterwave.com/v3";

  async registerSubAccount(data: RegisterSubAccountDto) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/virtual-account-numbers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
          body: JSON.stringify(data),
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBillCategories() {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/top-bill-categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBillers(category: string) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/bills/${category}/billers?country=NG`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBillInformation(billerCode: string) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/billers/${billerCode}/items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBillerInformation(category: string) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/bills/${category}/billers?country=NG`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async validateCustomerDetails({
    itemCode,
    billerCode,
    customer,
  }: {
    itemCode: string;
    billerCode: string;
    customer: string;
  }) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/bill-items/${itemCode}/validate?code=${billerCode}&customer=${customer}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createBillPayment({
    itemCode,
    billerCode,
    payload,
  }: {
    itemCode: string;
    billerCode: string;
    payload: {
      country: string;
      amount: number;
      customer_id: string;
    };
  }) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/billers/${billerCode}/items/${itemCode}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
          body: JSON.stringify(payload),
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPaymentStatus(reference: string) {
    try {
      const res = await fetch(
        `${FlutterwaveClient.baseUrl}/bills/${reference}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async fetchAllBalances(): Promise<FetchAllBalancesResponse> {
    try {
      const res = await fetch(`${FlutterwaveClient.baseUrl}/balances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET as string}`,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
