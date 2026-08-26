import { NextFunction, Request, Response } from "express";
import { AdminModel } from "../../../models/admin.model";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";

async function verifyAdminOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { emailAddress, otp } = req.body;

  try {
    const admin = await AdminModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    if (!admin) {
      return res.status(HTTPStatus.NOT_FOUND).json({
        message: "Admin not found",
      });
    }

    const [isOtpValid, message] = await admin.matchOTP(otp);

    if (!isOtpValid) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: message,
      });
    }

    admin.status = AccountStatus.active;
    await admin.save();

    return res.status(HTTPStatus.OK).json({
      message: "Admin verified",
      data: admin,
    });
  } catch (error) {}
}

export default verifyAdminOtpHandler;
