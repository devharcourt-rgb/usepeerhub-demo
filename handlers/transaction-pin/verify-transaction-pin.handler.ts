import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { TransactionPinModel } from "../../models/transaction-pin.model";
import mongoose from "mongoose";

async function verifyTransactionPinHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { pin } = req.body;
  const { userId } = getUser(req);

  try {
    const existingPin = await TransactionPinModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!existingPin) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Transaction pin not set");
    }

    const isMatch = await existingPin.matchPin(pin.toString());

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Transaction pin does not match",
      );
    }

    return res.json({
      message: "Transaction pin verified",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default verifyTransactionPinHandler;
