import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { PasscodeModel } from "../../models/passcode.model";
import mongoose from "mongoose";

async function setupPasscodeHandler(
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

    if (existingPasscode) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Passcode already set");
    }

    await PasscodeModel.create({
      user: new mongoose.Types.ObjectId(userId),
      passcode: passcode.toString(),
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Passcode set",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default setupPasscodeHandler;
