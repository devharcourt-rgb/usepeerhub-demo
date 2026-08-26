import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";
import { TransactionModel } from "../../../models/transaction.model";

async function getElectricityTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();
  const { id } = req.params;

  try {
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const { orderId } = transaction.metadata;

    const response = await nellobytesClient.getToken({ OrderID: orderId });

    console.log({ response });

    await transaction.updateOne({
      metadata: {
        token: response.metertoken,
        orderId: response.orderid,
        meterno: response.meterno,
      },
    });

    return res.json({
      message: "Token fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default getElectricityTokenHandler;
