import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";
import { ElectricityService } from "../../../services/electricity.service";
import { MeterType } from "../../../lib/nomba/type";

const virtualAccountService = new VirtualAccountService();
const electricityService = new ElectricityService();

/**
 * Dry-run check before /vend — resolves the meter/customer number, confirms
 * the account is active, and the wallet has enough balance, without
 * charging or vending.
 */
async function validateElectricityHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { disco, customerId, meterType, amount } = req.body as {
    disco: string;
    customerId: string;
    meterType: MeterType;
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

    const customerName = await electricityService.lookupCustomer(
      disco,
      customerId,
    );

    if (!customerName) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not resolve meter / customer number",
      );
    }

    const amountInKobo = Number(amount) * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    return res.json({
      message: "Electricity purchase is valid",
      data: { valid: true, customerName },
    });
  } catch (error) {
    next(error);
  }
}

export default validateElectricityHandler;
