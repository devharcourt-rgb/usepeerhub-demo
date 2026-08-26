import { NextFunction, Request, Response } from "express";
import { KycModel } from "../../../models/kyc.model";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getKycByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  try {
    let kyc;

    const blowappResponse = await KycModel.findById(id).populate({
      path: "user",
      select: "firstName lastName emailAddress phoneNumber dateOfBirth",
    });

    if (blowappResponse) {
      kyc = blowappResponse;
    } else {
      const blowmoneyClient = new BlowMoneyClient();

      const response = await blowmoneyClient.getKycById(id);

      kyc = response.data;
    }

    return res.json({
      message: "kyc fetched",
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
}

export default getKycByIdHandler;
