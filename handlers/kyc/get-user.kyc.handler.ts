import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { KycModel } from "../../models/kyc.model";

async function getUserKycHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);

  try {
    const kycDocumentWithHighestLevel = await KycModel.findOne({
      user: userId,
    }).sort({ tier: -1 });

    if (!kycDocumentWithHighestLevel) {
      return res.status(404).json({
        message: "No kyc document found for this user",
      });
    }

    return res.json({
      message: "Kyc document found",
      data: kycDocumentWithHighestLevel,
    });
  } catch (error) {
    next(error);
  }
}

export default getUserKycHandler;
