import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { PasscodeModel } from "../../models/passcode.model";
import mongoose from "mongoose";

async function verifyPasscodeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { passcode } = req.body;
  const { userId } = getUser(req);

  try {
    const existingPasscode = await PasscodeModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
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

    return res.json({
      message: "Passcode verified",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default verifyPasscodeHandler;
