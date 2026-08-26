import { KYCDocument } from "../types/kyc.types";

export function isValidDocumentType(documentType: KYCDocument) {
  const validDocumentTypes = Object.values(KYCDocument);

  if (!validDocumentTypes.includes(documentType)) {
    return false;
  }

  return true;
}
