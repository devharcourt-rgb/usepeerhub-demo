import {
  ConfigureSafulPayWebhookDto,
  CreateSafulPayInflowDto,
  CreateSafulPayOutflowDto,
  SafulPayLoginDto,
  VerifySafulPayOutflowDto,
} from "./interface";

export class SafulPayClient {
  private static baseUrl = "https://app.safulpay.com/api/merchant";

  async login(payload: SafulPayLoginDto) {
    try {
      const res = await fetch(`${SafulPayClient.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async configureWebhook(payload: ConfigureSafulPayWebhookDto) {
    try {
      const res = await fetch(`${SafulPayClient.baseUrl}/webhooks/configure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createInflow(payload: CreateSafulPayInflowDto) {
    try {
      const res = await fetch(`${SafulPayClient.baseUrl}/inflow/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createOutflow(payload: CreateSafulPayOutflowDto) {
    try {
      const res = await fetch(`${SafulPayClient.baseUrl}/outflow/single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async checkTransactionStatus(id: String) {
    try {
      const res = await fetch(
        `${SafulPayClient.baseUrl}/transaction/status/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async verify(payload: VerifySafulPayOutflowDto) {
    try {
      const res = await fetch(`${SafulPayClient.baseUrl}/kyc/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPackageList() {
    try {
      const res = await fetch(
        `${SafulPayClient.baseUrl}/outflow/package-list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SAFUL_PAY_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            service_name: "DSTV Nigeria",
          }),
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
