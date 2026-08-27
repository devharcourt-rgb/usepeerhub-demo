import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";

const virtualAccountService = new VirtualAccountService();

/**
 * Dry-run check before /vend — confirms the account is active and the wallet
 * has enough balance for the purchase, without charging or calling Nomba.
 */
async function validateAirtimeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { amount } = req.body;

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

    const amountInKobo = Number(amount) * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    return res.json({
      message: "Airtime purchase is valid",
      data: { valid: true },
    });
  } catch (error) {
    next(error);
  }
}

export default validateAirtimeHandler;
