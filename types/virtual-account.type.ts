export enum VirtualAccountType {
  INTERNAL = "internal",
  EXTERNAL = "external",
}

export interface IVirtualAccount {
  id: string;
  user: string;
  accountNumber: number;
  type: VirtualAccountType;
  accountID: string;
  bankName: string;
  createdAt?: Date;
  updatedAt?: Date;
  currency: string;
  source: string;
}
