import { NextFunction, Request, Response } from "express";
import { CableService } from "../../../services/cable.service";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { CableTvType } from "../../../lib/nomba/type";

const cableService = new CableService();

/** Resolves a smart card / IUC number to the customer's name before subscribing. */
async function lookupCableCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { cableTvType, customerId } = req.query as {
    cableTvType: CableTvType;
    customerId: string;
  };

  try {
    if (!cableTvType || !customerId) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "cableTvType and customerId are required",
      );
    }

    const customerName = await cableService.lookupCustomer(
      customerId,
      cableTvType,
    );

    return res.json({
      message: "Customer resolved",
      data: { customerName },
    });
  } catch (error) {
    next(error);
  }
}

export default lookupCableCustomerHandler;
