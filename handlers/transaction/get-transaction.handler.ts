import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { TransactionModel } from "../../models/transaction.model";
import mongoose from "mongoose";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { FlutterwaveClient } from "../../lib/flutterwave";
import { TransactionStatus } from "../../types/transaction.types";

async function getSingleTransactionHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  const flwClient = new FlutterwaveClient();

  try {
    const transaction = await TransactionModel.findById({
      user: new mongoose.Types.ObjectId(userId),
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!transaction) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Transaction not found");
    }

    const transactionRef = transaction.metadata?.reference;

    if (!transactionRef) {
      return res.json({
        message: "Transaction fetched",
        data: transaction,
      });
    }

    const flwClientResponse = await flwClient.getPaymentStatus(transactionRef);

    if (flwClientResponse.status === "error") {
      transaction.status = TransactionStatus.FAILED;

      await transaction.save();

      return res.json({
        message: flwClientResponse.message,
        status: flwClientResponse.status,
        data: {},
      });
    }

    return res.json({
      message: "Transaction fetched successfully",
      data: {
        transaction,
        flutterwaveResponse: flwClientResponse.data,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getSingleTransactionHandler;
