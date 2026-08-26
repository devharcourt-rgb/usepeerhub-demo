import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { getUser } from "../../utils/core.utils";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { PasscodeModel } from "../../models/passcode.model";

async function resetPasscodeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { otp, passcode } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "User not found");
    }

    const [isMatch, message] = await user.matchOTP(otp);

    if (!isMatch) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, message);
    }

    const existingPasscode = await PasscodeModel.findOne({
      user: userId,
    });

    if (!existingPasscode) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Passcode not previously set"
      );
    }

    existingPasscode.passcode = passcode;
    await existingPasscode.save();

    return res.json({
      message: "Passcode reset successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default resetPasscodeHandler;
