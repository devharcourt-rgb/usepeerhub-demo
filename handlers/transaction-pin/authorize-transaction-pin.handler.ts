import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { getUser } from "../../utils/core.utils";
import { TransactionPinModel } from "../../models/transaction-pin.model";
import { createTransactionAuthorizationToken } from "../../utils/transaction-authorization.utils";
import mongoose from "mongoose";

/**
 * Verifies the caller's transaction pin and, on success, issues a short-lived
 * single-use token scoped to `action` + `payload`. The raw pin is never sent
 * to the transaction endpoint itself - it presents this token instead, via
 * a route wrapped with `requireTransactionAuthorization` (see
 * middlewares/transaction-pin.ts).
 */
async function authorizeTransactionPinHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { pin, action, payload } = req.body;
  const { userId } = getUser(req);

  try {
    const existingPin = await TransactionPinModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!existingPin) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Transaction pin not set",
      );
    }

    const isMatch = await existingPin.matchPin(pin.toString());

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Transaction pin does not match",
      );
    }

    const { token, expiresIn } = await createTransactionAuthorizationToken({
      userId,
      action,
      payload,
    });

    return res.json({
      message: "Transaction pin verified",
      data: { token, expiresIn },
    });
  } catch (error) {
    next(error);
  }
}

export default authorizeTransactionPinHandler;
