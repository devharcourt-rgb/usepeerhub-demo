import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { getUser } from "../../utils/core.utils";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { TransactionPinModel } from "../../models/transaction-pin.model";

async function resetTransactionPinHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { otp, pin } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "User not found");
    }

    const [isMatch, message] = await user.matchOTP(otp);

    if (!isMatch) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, message);
    }

    const existingPin = await TransactionPinModel.findOne({
      user: userId,
    });

    if (!existingPin) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Transaction pin not previously set",
      );
    }

    existingPin.pin = pin;
    await existingPin.save();

    return res.json({
      message: "Transaction pin reset successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default resetTransactionPinHandler;
