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
import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";

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
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

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

    const files = req.files as
      | { [field: string]: Express.Multer.File[] }
      | undefined;

    if (!files?.documentImage?.[0] || !files?.selfieImage?.[0]) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "documentImage and selfieImage must be uploaded as multipart/form-data files, not as JSON fields",
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

    queueProducer.addJob({
      name: "send-kyc-review-email",
      data: {
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
      },
    });

    return res.json({
      message: "Verification in progress",
    });
  } catch (error) {
    next(error);
  }
}

export default completeKycHandler;
