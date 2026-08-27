import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { VirtualAccountService } from "../../../services/virtualAccount.service";
import { CableService } from "../../../services/cable.service";
import { CableTvType } from "../../../lib/nomba/type";

const virtualAccountService = new VirtualAccountService();
const cableService = new CableService();

/**
 * Dry-run check before /vend — resolves the package and the smart card /
 * IUC number, confirms the account is active, and the wallet has enough
 * balance, without charging or subscribing.
 */
async function validateCableHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { cableTvType, customerId, code } = req.body as {
    cableTvType: CableTvType;
    customerId: string;
    code: string;
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

    const product = await cableService.findProduct(cableTvType, code);

    if (!product || typeof product.amount !== "number") {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Cable package not found");
    }

    const customerName = await cableService.lookupCustomer(
      customerId,
      cableTvType,
    );

    if (!customerName) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Could not resolve smart card / IUC number",
      );
    }

    const amountInKobo = product.amount * 100;
    const { balance } = await virtualAccountService.getBalanceForUser(userId);

    if (amountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    return res.json({
      message: "Cable subscription is valid",
      data: { valid: true, customerName, product },
    });
  } catch (error) {
    next(error);
  }
}

export default validateCableHandler;
