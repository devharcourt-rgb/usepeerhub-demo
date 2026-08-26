import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { PasscodeModel } from "../../models/passcode.model";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";
import { CustomSession } from "../../utils/session.utils";
import { AccountRole } from "../../types/role.types";
import { sensitiveFields } from "../../utils/core.utils";

async function loginWithPasscodeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { passcode, emailAddress } = req.body;

  try {
    // finds user with email address
    const user = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    }).select(sensitiveFields);

    if (!user) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const existingPasscode = await PasscodeModel.findOne({
      user: new mongoose.Types.ObjectId(user._id as string),
    });

    if (!existingPasscode) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Passcode not set");
    }

    const isMatch = await existingPasscode.matchPasscode(passcode.toString());

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Passcode does not match",
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

    return res.json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default loginWithPasscodeHandler;
