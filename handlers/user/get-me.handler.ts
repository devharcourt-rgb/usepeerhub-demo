import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { PasscodeModel } from "../../models/passcode.model";
import { getUser, sensitiveFields } from "../../utils/core.utils";
import { KycModel } from "../../models/kyc.model";

async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  const { userId } = getUser(req);
  try {
    const user = await UserModel.findById(userId).select(sensitiveFields);

    const passcode = await PasscodeModel.findOne({
      user: userId,
    }).countDocuments();

    const kyc = await KycModel.findOne({
      user: userId,
    }).countDocuments();

    return res.status(200).json({
      message: "fetched user",
      data: {
        ...user?.toJSON(),
        isPasscodeSet: passcode > 0,
        isKycSet: kyc > 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getMeHandler;
