import { NextFunction, Request, Response } from "express";
import { BettingService } from "../../../services/betting.service";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

const bettingService = new BettingService();

/** Resolves a betting account customer ID to the customer's name before funding. */
async function lookupBettingCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { providerId, customerId } = req.query as {
    providerId: string;
    customerId: string;
  };

  try {
    if (!providerId || !customerId) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "providerId and customerId are required",
      );
    }

    const customerName = await bettingService.lookupCustomer(
      providerId,
      customerId,
    );

    return res.json({
      message: "Customer resolved",
      data: { customerName },
    });
  } catch (error) {
    next(error);
  }
}

export default lookupBettingCustomerHandler;
