import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { PasscodeModel } from "../../models/passcode.model";
import mongoose from "mongoose";

async function changePasscodeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { oldPasscode, newPasscode } = req.body;
  const { userId } = getUser(req);

  try {
    const existingPasscode = await PasscodeModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!existingPasscode) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Passcode not set");
    }

    const isMatch = await existingPasscode.matchPasscode(
      oldPasscode.toString()
    );

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Old passcode does not match"
      );
    }

    existingPasscode.passcode = newPasscode;
    await existingPasscode.save();

    return res.status(HTTPStatus.OK).json({
      message: "Passcode changed",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default changePasscodeHandler;
