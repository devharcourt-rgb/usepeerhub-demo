import { NombaClient } from "../lib/nomba";
import { AirtimeNetwork, Telco } from "../lib/nomba/type";

// fetchDataPlans() takes the lowercase Telco form; purchaseDataBundle()
// takes the uppercase AirtimeNetwork form. Nomba's own API is inconsistent
// here, so callers only ever deal in Telco and this maps internally.
const TELCO_TO_NETWORK: Record<Telco, AirtimeNetwork> = {
  mtn: "MTN",
  glo: "GLO",
  airtel: "AIRTEL",
  "9mobile": "9MOBILE",
};

export class DataService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  async fetchDataPlans(telco: Telco) {
    const response = await this.nombaClient.fetchDataPlans(telco);
    return response.data;
  }

  /** Looks up a single plan by productId within a telco's plan list. */
  async findDataPlan(telco: Telco, productId: string) {
    const plans = await this.fetchDataPlans(telco);
    return plans.find((plan) => plan.productId === productId) ?? null;
  }

  async purchaseDataBundle({
    telco,
    productId,
    phoneNumber,
    merchantTxRef,
    senderName,
  }: {
    telco: Telco;
    productId: string;
    phoneNumber: string;
    merchantTxRef: string;
    senderName?: string;
  }) {
    const response = await this.nombaClient.purchaseDataBundle({
      productId,
      phoneNumber,
      network: TELCO_TO_NETWORK[telco],
      merchantTxRef,
      senderName,
    });

    return response.data;
  }
}
