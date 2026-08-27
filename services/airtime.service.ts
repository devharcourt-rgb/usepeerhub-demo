import { NombaClient } from "../lib/nomba";
import { AirtimeNetwork } from "../lib/nomba/type";

export class AirtimeService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  async purchaseAirtime({
    amount,
    phoneNumber,
    network,
    merchantTxRef,
    senderName,
  }: {
    amount: number;
    phoneNumber: string;
    network: AirtimeNetwork;
    merchantTxRef: string;
    senderName?: string;
  }) {
    const response = await this.nombaClient.purchaseAirtime({
      amount,
      phoneNumber,
      network,
      merchantTxRef,
      senderName,
    });

    return response.data;
  }
}
