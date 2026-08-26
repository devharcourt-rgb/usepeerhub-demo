import {
  CheckMeterDto,
  VendElectricityDto,
  VendAirtimeDto,
  PriceListDto,
  VendDataDto,
  VendTVDto,
} from "./types";

class BuyPowerClient {
  static readonly baseUrl = "https://api.buypower.ng/v2";

  async checkDisco() {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/discos/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async checkMeter(data: CheckMeterDto) {
    try {
      const res = await fetch(
        `${BuyPowerClient.baseUrl}/check/meter?meter=${data.meter}&disco=${data.disco}&vendType=${data.vendType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async vendElectricity(data: VendElectricityDto) {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/vend?strict=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async priceList(data: PriceListDto) {
    const { vertical, provider } = data;
    try {
      const res = await fetch(
        `${BuyPowerClient.baseUrl}/tariff/?vertical=${vertical}&provider=${provider}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async vendAirtime(data: VendAirtimeDto) {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/vend?strict=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async vendData(data: VendDataDto) {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/vend?strict=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async vendTV(data: VendTVDto) {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/vend?strict=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getProvideStatus() {
    try {
      const res = await fetch(
        `${BuyPowerClient.baseUrl}/providers/reliability-index`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
          },
        }
      );

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getWalletBalance() {
    try {
      const res = await fetch(`${BuyPowerClient.baseUrl}/wallet/balance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
        },
      });

      return res.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reQuery(order_id: string) {
    try {
      const res = await fetch(
        `${BuyPowerClient.baseUrl}/transaction/${order_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BUYPOWER_SECRET as string}`,
          },
        }
      );

      const contentType = res.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get("retry-after");
          return {
            status: 429,
            message: "Try again later.",
            retryAfter: retryAfter ? Number(retryAfter) : 60,
          };
        }
        if (data.message === "Transaction failed. Refund already processed.") {
          return {
            status: 423,
            message: data.message,
            data: {
              transaction: "failed",
            },
            action: ["Refund Customer"],
          };
        }
        if (data.message) {
          return {
            status: 400,
            message: data.message,
            data: {
              transaction: "failed",
            },
          };
        }
        throw new Error(`BuyPower API Error ${res.status}: ${data}`);
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default BuyPowerClient;
