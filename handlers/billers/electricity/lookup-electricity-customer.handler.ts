import { NextFunction, Request, Response } from "express";
import { ElectricityService } from "../../../services/electricity.service";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

const electricityService = new ElectricityService();

/** Resolves a meter/customer number to the customer's name before vending. */
async function lookupElectricityCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { disco, customerId } = req.query as {
    disco: string;
    customerId: string;
  };

  try {
    if (!disco || !customerId) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "disco and customerId are required",
      );
    }

    const customerName = await electricityService.lookupCustomer(
      disco,
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

export default lookupElectricityCustomerHandler;
