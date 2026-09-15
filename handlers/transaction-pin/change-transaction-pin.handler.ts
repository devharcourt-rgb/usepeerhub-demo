import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { TransactionPinModel } from "../../models/transaction-pin.model";
import mongoose from "mongoose";

async function changeTransactionPinHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { oldPin, newPin } = req.body;
  const { userId } = getUser(req);

  try {
    const existingPin = await TransactionPinModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!existingPin) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Transaction pin not set");
    }

    const isMatch = await existingPin.matchPin(oldPin.toString());

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Old transaction pin does not match",
      );
    }

    existingPin.pin = newPin;
    await existingPin.save();

    return res.status(HTTPStatus.OK).json({
      message: "Transaction pin changed",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default changeTransactionPinHandler;
