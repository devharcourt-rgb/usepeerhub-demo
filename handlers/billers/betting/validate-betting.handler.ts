import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";
import { BettingService } from "../../../services/betting.service";

const virtualAccountService = new VirtualAccountService();
const bettingService = new BettingService();

/**
 * Dry-run check before /vend — resolves the betting account, confirms the
 * account is active, and the wallet has enough balance, without charging
 * or funding.
 */
async function validateBettingHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { providerId, customerId, amount } = req.body as {
    providerId: string;
    customerId: string;
    amount: number;
  };

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Your account is not active. Please verify your account",
      );
    }

    const customerName = await bettingService.lookupCustomer(
      providerId,
      customerId,
    );

    if (!customerName) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not resolve betting account",
      );
    }

    const amountInKobo = Number(amount) * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    return res.json({
      message: "Betting wallet funding is valid",
      data: { valid: true, customerName },
    });
  } catch (error) {
    next(error);
  }
}

export default validateBettingHandler;
