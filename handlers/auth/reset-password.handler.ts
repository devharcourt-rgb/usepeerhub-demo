import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { AccountStatus } from "../../types/user.types";
import { UserModel } from "../../models/user.model";

async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { password, emailAddress, otp } = req.body;

  try {
    const user = await UserModel.findOne({ emailAddress }).select("-password");

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "account not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "account not active. Please verify account",
      );
    }

    const [isMatch, message] = await user.matchOTP(otp);

    if (!isMatch) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, message);
    }

    user.password = password;
    await user.save();

    return res.json({
      message: "Password reset successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default resetPasswordHandler;
