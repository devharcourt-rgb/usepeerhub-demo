export class NelloBytesClient {
  static readonly baseUrl = "https://www.nellobytesystems.com";

  async getElectricityDiscos() {
    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIElectricityDiscosV1.asp`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getCables() {
    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APICableTVPackagesV2.asp`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async validateCustomer(data: { ElectricCompany: string; MeterNo: string }) {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIVerifyElectricityV1.asp?UserID=${userId}&APIKey=${apiKey}&ElectricCompany=${data.ElectricCompany}&MeterNo=${data.MeterNo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async validateCable(data: { CableTV: string; SmartCardNo: string }) {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIVerifyCableTVV1.0.asp?UserID=${userId}&APIKey=${apiKey}&CableTV=${data.CableTV}&SmartCardNo=${data.SmartCardNo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async purchaseElectricity(data: {
    ElectricCompany: string;
    MeterNo: string;
    MeterType: string;
    Amount: string;
    PhoneNo: string;
    CallbackURL: string;
  }) {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIElectricityV1.asp?UserID=${userId}&APIKey=${apiKey}&ElectricCompany=${data.ElectricCompany}&MeterNo=${data.MeterNo}&Amount=${data.Amount}&PhoneNo=${data.PhoneNo}&CallbackURL=${data.CallbackURL}&MeterType=${data.MeterType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBalance() {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIWalletBalanceV1.asp?UserID=${userId}&APIKey=${apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getToken(data: { OrderID: string }) {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIQueryV1.0.asp?UserID=${userId}&APIKey=${apiKey}&OrderID=${data.OrderID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async purchaseCable(data: {
    CableTV: string;
    Package: string;
    SmartCardNo: string;
    PhoneNo: string;
    CallbackURL: string;
  }) {
    const userId = process.env.NELLOBYTES_USER_ID;
    const apiKey = process.env.NELLOBYTES_API_KEY;

    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APICableTVV1.asp?UserID=${userId}&APIKey=${apiKey}&CableTV=${data.CableTV}&Package=${data.Package}&PhoneNo=${data.PhoneNo}&CallbackURL=${data.CallbackURL}&SmartCardNo=${data.SmartCardNo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );
      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBettingCompaines() {
    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIBettingCompaniesV2.asp`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async fundBettingWallet(data: {
    bettingCompany: string;
    amount: string;
    customerId: string;
    requestId: string;
  }) {
    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIBettingV1.asp?BettingCompany=${data.bettingCompany}&Amount=${data.amount}&CustomerID=${data.customerId}&RequestID=${data.requestId}&APIKey=${process.env.NELLOBYTES_API_KEY}&UserID=${process.env.NELLOBYTES_USER_ID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async verifyBettingWallet(data: {
    customerId: string;
    bettingCompany: string;
  }) {
    try {
      const res = await fetch(
        `${NelloBytesClient.baseUrl}/APIVerifyBettingV1.asp?BettingCompany=${data.bettingCompany}&CustomerID=${data.customerId}&APIKey=${process.env.NELLOBYTES_API_KEY}&UserID=${process.env.NELLOBYTES_USER_ID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NELLOBYTES_API_KEY as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
