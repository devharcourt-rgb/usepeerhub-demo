import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";
import { DataService } from "../../../services/data.service";
import { Telco } from "../../../lib/nomba/type";

const virtualAccountService = new VirtualAccountService();
const dataService = new DataService();

/**
 * Dry-run check before /vend — confirms the plan exists, the account is
 * active, and the wallet has enough balance, without charging or calling
 * Nomba's purchase endpoint.
 */
async function validateDataHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { telco, productId } = req.body as { telco: Telco; productId: string };

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

    const plan = await dataService.findDataPlan(telco, productId);

    if (!plan) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Data plan not found");
    }

    const amountInKobo = plan.amount * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    return res.json({
      message: "Data purchase is valid",
      data: { valid: true, plan },
    });
  } catch (error) {
    next(error);
  }
}

export default validateDataHandler;
