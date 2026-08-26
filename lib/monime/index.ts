import { CreateFinancialAccountDto } from "./interfaces";

export class MonimeClient {
  private baseUrl = "https://api.monime.io/v1";

  private config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MONIME_ACCESS_TOKEN as string}`,
      "Monime-Space-Id": `${process.env.MONIME_SPACE_ID as string}`,
    },
  };

  async createFinancialAccount({
    data,
    idemKey,
  }: {
    data: CreateFinancialAccountDto;
    idemKey: string;
  }) {
    try {
      const res = await fetch(`${this.baseUrl}/financial-accounts`, {
        method: "POST",
        headers: {
          ...this.config.headers,
          "Idempotency-Key": idemKey,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async listBanks() {
    try {
      const res = await fetch(`${this.baseUrl}/banks`, {
        method: "GET",
        headers: {
          ...this.config.headers,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async listMomos() {
    try {
      const res = await fetch(`${this.baseUrl}/momos`, {
        method: "GET",
        headers: {
          ...this.config.headers,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
