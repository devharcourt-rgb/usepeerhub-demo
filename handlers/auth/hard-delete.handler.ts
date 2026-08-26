import { NextFunction, Request, Response } from "express";
import UserService from "../../services/user.service";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { CustomSession } from "../../utils/session.utils";
import { AccountStatus } from "../../types/user.types";
import { PasscodeModel } from "../../models/passcode.model";
import { KycModel } from "../../models/kyc.model";
import { nodemailerClient } from "../../config/mail";

async function HardDelete(req: Request, res: Response, next: NextFunction) {
  const { email } = req.params;

  const userService = new UserService();

  try {
    const user = await userService.findUser({
      emailAddress: email,
    });

    if (!user) {
      throw new HTTPException(
        HTTPStatus.NOT_FOUND,
        "user with email not found"
      );
    }

    await user.deleteAcc();

    return res.json({
      message: "Login successful",
      data: {
        ...user.toJSON()}
    });
  } catch (error) {
    next(error);
  }
}

export default HardDelete;
