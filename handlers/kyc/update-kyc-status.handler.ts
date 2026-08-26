import { NextFunction, Response } from "express";
import { KYCStatus } from "../../types/kyc.types";
import HTTPException from "../../utils/error.utils";
import { KycModel } from "../../models/kyc.model";
import { HTTPStatus } from "../../utils/http.utils";

async function updateKycStatusHandler(
  req: any,
  res: Response,
  next: NextFunction
) {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const isValidStatus = Object.values(KYCStatus).includes(status);

    if (!isValidStatus) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid status");
    }

    const kycDocument = await KycModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!kycDocument) {
      throw new HTTPException(HTTPStatus.CONFLICT, "document not found");
    }

    return res.json({
      message: "Document updated",
      data: kycDocument,
    });
  } catch (error) {
    next(error);
  }
}

export default updateKycStatusHandler;
