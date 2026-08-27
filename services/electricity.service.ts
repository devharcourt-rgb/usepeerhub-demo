import { NombaClient } from "../lib/nomba";
import { MeterType } from "../lib/nomba/type";

export class ElectricityService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  /** Discos rarely change — callers should cache this response. */
  async fetchDiscos() {
    const response = await this.nombaClient.fetchElectricityDiscos();
    return response.data;
  }

  /** Resolves a meter/customer number to the customer's name. */
  async lookupCustomer(disco: string, customerId: string) {
    const response = await this.nombaClient.lookupElectricityCustomer(
      disco,
      customerId,
    );
    return response.data;
  }

  async payBill({
    disco,
    customerId,
    meterType,
    amount,
    payerName,
    merchantTxRef,
  }: {
    disco: string;
    customerId: string;
    meterType: MeterType;
    amount: number;
    payerName: string;
    merchantTxRef: string;
  }) {
    const response = await this.nombaClient.payElectricityBill({
      disco,
      customerId,
      meterType,
      amount,
      payerName,
      merchantTxRef,
    });

    return response.data;
  }
}
