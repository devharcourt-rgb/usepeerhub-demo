import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { TransactionPinModel } from "../../models/transaction-pin.model";
import mongoose from "mongoose";

async function setupTransactionPinHandler(
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

    if (existingPin) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Transaction pin already set",
      );
    }

    await TransactionPinModel.create({
      user: new mongoose.Types.ObjectId(userId),
      pin: pin.toString(),
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Transaction pin set",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default setupTransactionPinHandler;
