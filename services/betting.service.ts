import { NombaClient } from "../lib/nomba";

export class BettingService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  async fetchProviders() {
    const response = await this.nombaClient.fetchBettingProviders();
    return response.data;
  }

  /** Resolves a betting account customer ID to the customer's name. */
  async lookupCustomer(providerId: string, customerId: string) {
    const response = await this.nombaClient.lookupBettingCustomer(
      providerId,
      customerId,
    );
    return response.data;
  }

  // BettingProvider carries id/biller_id/lookup_id with no doc on which one
  // each Nomba endpoint expects — lookupCustomer's providerId and
  // payBettingBill's bettingProvider are both fed BettingProvider.id here;
  // worth confirming against the sandbox.
  async payBill({
    providerId,
    customerId,
    phoneNumber,
    amount,
    payerName,
    merchantTxRef,
  }: {
    providerId: string;
    customerId: string;
    phoneNumber: string;
    amount: number;
    payerName: string;
    merchantTxRef: string;
  }) {
    const response = await this.nombaClient.payBettingBill({
      bettingProvider: providerId,
      customerId,
      phoneNumber,
      amount,
      payerName,
      merchantTxRef,
    });

    return response.data;
  }
}
