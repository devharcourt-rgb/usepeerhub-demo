import { NextFunction, Request, Response } from "express";
import { SafulPayClient } from "../../../lib/safulpay";
import { SafulPayVerifyOutflowResponse } from "../../../lib/safulpay/interface";

async function validateSafulpayOutflowDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { recipient, category, amount } = req.body;

  const safulpayClient = new SafulPayClient();

  try {
    const response = await safulpayClient.verify({
      transaction_mode: category,
      recipient_details: recipient,
      amount: amount,
    });

    const { message, data } = response as SafulPayVerifyOutflowResponse;

    return res.json({
      message,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export default validateSafulpayOutflowDetailHandler;
