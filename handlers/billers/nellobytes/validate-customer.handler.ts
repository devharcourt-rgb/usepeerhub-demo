import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";

async function validateCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();
  const { electricCompany, meterNo } = req.body;

  try {
    const response = await nellobytesClient.validateCustomer({
      ElectricCompany: electricCompany,
      MeterNo: meterNo,
    });

    return res.json({
      message: "Customer validated successfully",
      success: response.customer_name.length > 3,
      data: {
        customer_name:
          response.customer_name.length > 3
            ? response.customer_name
            : "Account does not exist. Please check and re-enter",
      },
    });
  } catch (error) {
    next(error);
  }
}

export default validateCustomerHandler;
