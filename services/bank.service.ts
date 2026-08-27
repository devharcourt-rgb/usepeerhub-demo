import { NombaClient } from "../lib/nomba";

export class BankService {
  private nombaClient: NombaClient;

  constructor() {
    this.nombaClient = new NombaClient();
  }

  /** Bank codes rarely change — callers should cache this response. */
  async getBankList() {
    const response = await this.nombaClient.fetchBanks();
    return response.data;
  }

  async validateBankAccount(accountNumber: string, bankCode: string) {
    const response = await this.nombaClient.lookupBankAccount({
      accountNumber,
      bankCode,
    });
    return response.data;
  }

  async initiateBankTransfer({
    amount,
    accountNumber,
    accountName,
    bankCode,
    senderName,
    narration = "Transfer from PeerHub",
  }: {
    amount: number;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    senderName: string;
    narration?: string;
  }) {
    const response = await this.nombaClient.transferToBankAccount({
      amount,
      accountNumber,
      accountName,
      bankCode,
      senderName,
      narration,
      merchantTxRef: `transfer-${Date.now()}`,
    });

    return response.data;
  }
}
