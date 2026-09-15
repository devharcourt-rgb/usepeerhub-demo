import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { CustomSession } from "../../utils/session.utils";
import { AccountStatus } from "../../types/user.types";
import { PasscodeModel } from "../../models/passcode.model";
import { TransactionPinModel } from "../../models/transaction-pin.model";
import { KycModel } from "../../models/kyc.model";
import DeviceToken from "../../models/device-token.model";
import { UserModel } from "../../models/user.model";
import { AccountRole } from "../../types/role.types";

async function loginHandler(req: Request, res: Response, next: NextFunction) {
  const { emailAddress, password } = req.body;

  try {
    const user = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    }).select("-otp -otpExpire");

    if (!user) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "invalid credentials");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "invalid credentials");
    }

    const accountStatus = user.status as string;

    if (
      accountStatus === AccountStatus.suspended ||
      accountStatus === AccountStatus.deactivated
    ) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "account has been suspended. Please contact support",
      );
    }

    (req.session as CustomSession).userId = user.id;
    (req.session as CustomSession).role = AccountRole.USER;

    req.session.save(function (error) {
      if (error) {
        console.log("Error saving session: ", error);
      } else {
        console.log("Session saved");
      }
    });

    const isPasscodeSet = await PasscodeModel.countDocuments({
      user: user.id,
    });

    const isKycSet = await KycModel.countDocuments({
      user: user.id,
    });

    const isPinSet = await TransactionPinModel.countDocuments({
      user: user.id,
    });

    const isFcmTokenSet = await DeviceToken.countDocuments({
      user_id: user.id,
    });

    return res.json({
      message: "Login successful",
      data: {
        ...user.toJSON(),
        isPasscodeSet: isPasscodeSet > 0,
        isKycSet: isKycSet > 0,
        isPinSet: isPinSet > 0,
        isFcmTokenSet: isFcmTokenSet > 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default loginHandler;
