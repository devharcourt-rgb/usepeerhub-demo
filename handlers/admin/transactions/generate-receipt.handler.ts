import { NextFunction, Request, Response } from "express";
import { TransactionModel } from "../../../models/transaction.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import QueueProducer from "../../../queue/producer";
import { redisConnection } from "../../../config/redis";
import { IUser } from "../../../types/user.types";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function generateTransactionReceiptHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  try {
    const queueProducer = new QueueProducer(
      redisConnection,
      DEFAULT_REDIS_QUEUE,
    );

    const transaction = await TransactionModel.findOne({
      _id: id,
    })
      .select("user amount currency createdAt type status")
      .populate({
        path: "user",
        select: "firstName emailAddress",
      });

    // if transaction is a blow pay transaction
    if (transaction) {
      await queueProducer.addJob({
        name: "generate-receipt",
        data: {
          recipient: (transaction.user as unknown as IUser).emailAddress,
          firstName: (transaction.user as unknown as IUser).firstName,
          id: transaction._id,
          amount: transaction.amount,
          currency: "NGN",
          transactionDate: (transaction as any).createdAt,
          type: transaction.type,
          status: transaction.status,
        },
      });
    } else {
      const blowMoneyClient = new BlowMoneyClient();

      const response = await blowMoneyClient.generateTransactionReceipt(id);

      if (!response) {
        throw new HTTPException(
          HTTPStatus.BAD_REQUEST,
          "Error generating receipt",
        );
      }
    }

    res.status(HTTPStatus.OK).json({
      message: "Generating receipt",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default generateTransactionReceiptHandlerForAdmin;
