import {
  CreateAccountInterface,
  CreateCustomerInterface,
  GetAccountsInterface,
  TransferInterface,
} from "./types";

export default class SudoAfricaClient {
  static readonly baseUrl = process.env.SUDO_AFRICA_API_URL as string;

  constructor() {}

  async createCustomer(data: CreateCustomerInterface) {
    try {
      const res = await fetch(`${SudoAfricaClient.baseUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUDO_AFRICA_API_KEY as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getFundingSources() {
    try {
      const res = await fetch(`${SudoAfricaClient.baseUrl}/fundingsources`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUDO_AFRICA_API_KEY as string}`,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccounts(data: GetAccountsInterface) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/accounts?currency=${data.currency}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getCards(customerId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/cards/customer/${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getCardTransactions(cardId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/cards/${cardId}/transactions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async generateCardToken(cardId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/cards/${cardId}/token`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createAccount(data: CreateAccountInterface) {
    try {
      const res = await fetch(`${SudoAfricaClient.baseUrl}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUDO_AFRICA_API_KEY as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccount(accountId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/accounts/${accountId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccountBalance(accountId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/accounts/${accountId}/balance`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAccountTransactions(accountId: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/accounts/${accountId}/transactions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async getBanks(countryCode: string) {
    try {
      const res = await fetch(
        `${SudoAfricaClient.baseUrl}/accounts/banks?country${countryCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.SUDO_AFRICA_API_KEY as string
            }`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async transfer(data: TransferInterface) {
    try {
      const res = await fetch(`${SudoAfricaClient.baseUrl}/accounts/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUDO_AFRICA_API_KEY as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
