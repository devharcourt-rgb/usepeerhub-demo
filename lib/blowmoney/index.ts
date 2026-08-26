import { KYCStatus } from "../../types/kyc.types";
import { TransactionStatus } from "../../types/transaction.types";

export class BlowMoneyClient {
  static baseUrl = process.env.BLOWMONEY_URL;

  constructor() {}

  async getAllCards({
    page = 1,
    limit = 10,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/cards?page=${page}&limit=${limit}${
          search ? `&search=${search}` : ""
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async activateCard(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/card/${id}/activate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async blockCard(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/card/${id}/block`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getCard(id: string) {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/card/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async updateCard(id: string, data: Record<string, any>) {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/card/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/analytics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getUsers(query: Record<string, any>) {
    try {
      const stringifiedQuery = JSON.stringify(query);

      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/users?query=${stringifiedQuery}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getUser(id: string) {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/user/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getCardAnalytics(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/cards/${id}/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getTransactionAnalytics(userId: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/transactions/analytics?user=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getTransactions({
    query,
    search,
  }: {
    query: Record<string, any>;
    search?: string;
  }) {
    try {
      let jsonQuery = JSON.stringify(query);

      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/transactions?query=${jsonQuery}${
          search ? `&search=${search}` : ""
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getTransactionById(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/transaction/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getVirtualAccounts({
    query,
    skip,
    limit,
  }: {
    query: Record<string, any>;
    skip: number;
    limit: number;
  }) {
    try {
      const stringifiedQuery = JSON.stringify(query);

      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/virtual-accounts?skip=${skip}&limit=${limit}&query=${stringifiedQuery}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getAllKycs(query: Record<string, any>) {
    try {
      const stringifiedQuery = JSON.stringify(query);

      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/kycs?query=${stringifiedQuery}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getVirtualAccountById(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/virtual-accounts/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async getKycById(id: string) {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/kyc/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async updateKycStatus({ id, status }: { id: string; status: KYCStatus }) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/kycs/${id}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async generateTransactionReceipt(id: string) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/transaction/${id}/generate-receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async updateTransactionStatus({
    id,
    status,
  }: {
    id: string;
    status: TransactionStatus;
  }) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/transaction/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async updateUserStatus({
    id,
    status,
  }: {
    id: string;
    status: TransactionStatus;
  }) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/user/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async topUpVirtualAccount({ id, amount }: { id: string; amount: number }) {
    try {
      const res = await fetch(
        `${BlowMoneyClient.baseUrl}/admin/virtual-accounts/${id}/topup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        }
      );

      return await res.json();
    } catch (error) {
      throw error;
    }
  }

  async updateSystemStatus({
    message,
    status,
  }: {
    message: string;
    status: string;
  }) {
    try {
      const res = await fetch(`${BlowMoneyClient.baseUrl}/admin/system-info`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      return await res.json();
    } catch (error) {
      throw error;
    }
  }
}
