import { NombaClient } from "../lib/nomba";
import { CableTvType } from "../lib/nomba/type";

export class CableService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  /** Packages/prices for a provider — cache on the client, these rarely change. */
  async fetchProducts(cableTvType: CableTvType) {
    const response = await this.nombaClient.fetchCableTvProducts(cableTvType);
    return response.data;
  }

  /** Looks up a single package by code within a provider's product list. */
  async findProduct(cableTvType: CableTvType, code: string) {
    const products = await this.fetchProducts(cableTvType);
    return (
      products.find(
        (product) => product.code === code || product.productId === code,
      ) ?? null
    );
  }

  /** Resolves a smart card / IUC number to the customer's name. */
  async lookupCustomer(customerId: string, cableTvType: CableTvType) {
    const response = await this.nombaClient.lookupCableTvCustomer(
      customerId,
      cableTvType,
    );
    return response.data;
  }

  async subscribe({
    cableTvType,
    customerId,
    amount,
    payerName,
    merchantTxRef,
  }: {
    cableTvType: CableTvType;
    customerId: string;
    amount: number;
    payerName: string;
    merchantTxRef: string;
  }) {
    const response = await this.nombaClient.subscribeCableTv({
      cableTvType,
      customerId,
      amount,
      payerName,
      merchantTxRef,
    });

    return response.data;
  }
}
