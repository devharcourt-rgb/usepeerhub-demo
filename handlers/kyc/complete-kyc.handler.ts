import { NextFunction, Response } from "express";
import { KYCStatus } from "../../types/kyc.types";
import HTTPException from "../../utils/error.utils";
import mongoose from "mongoose";
import { getUser, processFileUploads } from "../../utils/core.utils";
import { KycModel } from "../../models/kyc.model";
import { HTTPStatus } from "../../utils/http.utils";
import { isValidDocumentType } from "../../utils/kyc.utils";
import UploadService from "../../services/upload.service";
import { VirtualAccountService } from "../../services/virtualAccount.service";
import { UserModel } from "../../models/user.model";
import { formatPhoneNumber } from "../../utils/auth.utils";

async function completeKycHandler(req: any, res: Response, next: NextFunction) {
  const {
    tier = 1,
    documentType,
    idNumber,
    expiryDate,
    phoneNumber,
    dateOfBirth,
  } = req.body;
  const { userId } = getUser(req);

  const uploadService = new UploadService();
  const virtualAccountService = new VirtualAccountService();

  try {
    if (
      !documentType ||
      !idNumber ||
      !expiryDate ||
      !phoneNumber ||
      !dateOfBirth
    ) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "All fields are required",
      );
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "User with id not found");
    }

    const kycDocumentForCurrentTier = await KycModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
      tier: parseInt(tier),
    });

    if (kycDocumentForCurrentTier) {
      throw new HTTPException(
        HTTPStatus.CONFLICT,
        "kyc document already exists for this tier",
      );
    }

    const isValid = isValidDocumentType(documentType);

    if (!isValid) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid document type");
    }

    const currentDateInMilliseconds = Date.now();
    const expiryDateInMilliseconds = new Date(expiryDate).getTime();

    if (expiryDateInMilliseconds < currentDateInMilliseconds) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Expiry date must be in the future",
      );
    }

    user.phoneNumber = formatPhoneNumber(phoneNumber, "Nigeria");
    user.country = "Nigeria";

    await user.save();

    const uploadUrls = await processFileUploads(req.files, uploadService);

    await KycModel.create({
      user: new mongoose.Types.ObjectId(userId),
      status: KYCStatus.IN_REVIEW,
      tier: parseInt(tier),
      documentImage: uploadUrls["documentImage"],
      selfieImage: uploadUrls["selfieImage"],
      documentType,
      expiryDate: new Date(expiryDate),
      idNumber,
      country: user.country,
    });

    // await virtualAccountService.generate(user, true);

    return res.json({
      message: "Verification in progress",
    });
  } catch (error) {
    next(error);
  }
}

export default completeKycHandler;
