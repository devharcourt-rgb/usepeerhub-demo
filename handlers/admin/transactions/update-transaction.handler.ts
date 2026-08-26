import { NextFunction, Request, Response } from "express";
import { TransactionModel } from "../../../models/transaction.model";
import { TransactionStatus } from "../../../types/transaction.types";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function updateTransactionHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const isValidStatus = Object.values(TransactionStatus).includes(status);

    if (!isValidStatus) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const transaction = await TransactionModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (transaction) {
      return res.status(HTTPStatus.OK).json({
        message: "Transaction updated successfully",
        data: transaction,
      });
    } else {
      const blowMoneyClient = new BlowMoneyClient();

      const response = await blowMoneyClient.updateTransactionStatus({
        id,
        status,
      });

      return res.status(HTTPStatus.OK).json({
        message: "Transaction updated successfully",
        data: response.data,
      });
    }
  } catch (error) {
    next(error);
  }
}

export default updateTransactionHandlerForAdmin;
