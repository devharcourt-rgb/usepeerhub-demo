export enum KYCStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  UNVERIFIED = "unverified",
  VERIFIED = "verified",
  IN_REVIEW = "in-review",
}

export enum KYCDocument {
  INTERNATIONAL_PASSPORT = "international-passport",
  NATIONAL_IDENTITY_NUMBER = "national-identity-number",
  DRIVERS_LICENSE = "drivers-license",
  VOTERS_CARD = "voters-card",
  TAX_IDENTIFICATION_NUMBER = "tax-identification-number",
  OTHER = "other",
}

export interface IKYC {
  id?: string;
  user: string;
  country: string;
  status?: KYCStatus;
  tier: number;
  documentType: KYCDocument;
  idNumber: string;
  documentImage: string;
  selfieImage: string;
  expiryDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
