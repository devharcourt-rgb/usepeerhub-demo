export interface CreateFinancialAccountDto {
  name: string;
  currency: "USD" | "SLE";
  reference?: string;
  description?: string;
  metadata?: object;
}
