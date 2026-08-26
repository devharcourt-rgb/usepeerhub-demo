import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";

async function validateCableHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();
  const { cableTv, smartCardNo } = req.body;

  try {
    const response = await nellobytesClient.validateCable({
      CableTV: cableTv,
      SmartCardNo: smartCardNo,
    });

    return res.json({
      message: "Cable validated successfully",
      data: { customer_name: response.customer_name },
    });
  } catch (error) {
    next(error);
  }
}

export default validateCableHandler;
