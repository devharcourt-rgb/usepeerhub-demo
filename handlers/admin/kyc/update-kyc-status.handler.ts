import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { KycModel } from "../../../models/kyc.model";
import { AdminRole } from "../../../types/role.types";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { KYCStatus } from "../../../types/kyc.types";

async function updateKycStatusHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;
  const { status } = req.body;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    // allow all admins to get all kyc data
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    const isValidKycStatus = Object.values(KYCStatus).includes(status);

    if (!isValidKycStatus) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid kyc status");
    }

    let kycDocument;

    const blowpayKyc = await KycModel.findById(id).select("user status");

    if (blowpayKyc) {
      blowpayKyc.status = status;
      await blowpayKyc.save();

      kycDocument = blowpayKyc;
    } else {
      const blowmoneyKyc = await blowmoneyClient.updateKycStatus({
        id,
        status,
      });

      kycDocument = blowmoneyKyc.data;
    }

    return res.status(200).json({
      message: "Kyc status updated",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default updateKycStatusHandlerForAdmin;
