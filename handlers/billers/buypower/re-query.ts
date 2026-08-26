import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import { HTTPStatus } from "../../../utils/http.utils";
import { TransactionModel } from "../../../models/transaction.model";
import HTTPException from "../../../utils/error.utils";
import redisConnection from "../../../config/redis";
import { updateTransaction } from "../../../utils/transaction.utils";
import QueueProducer from "../../../queue/producer";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { TransactionStatus } from "../../../types/transaction.types";

const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

async function reQueryHandler(req: Request, res: Response, next: NextFunction) {
  const buyPowerClient = new BuyPowerClient();
  const { id } = req.params;

  try {
    const transaction = await TransactionModel.findById(id.toString());

    if (!transaction) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Transaction not found");
    }

    if (transaction.status == TransactionStatus.FAILED) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "You can not retry failed transactions",
      );
    }

    const cacheKey = `requery:${id}`;
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for transaction ${id}`);
      const data = JSON.parse(cached);
      return res.status(HTTPStatus.OK).json(data);
    }

    const response = await buyPowerClient.reQuery(id.toString());
    const resultData = response?.result?.data || {};
    if (!response?.result?.status) {
      const state = updateTransaction(response);
      transaction.status = state.status;
      if (state.retry) {
        queueProducer.addJob({
          name: "auto-requery-bp",
          data: {
            transactionId: transaction._id.toString(),
            retryCount: 0,
            transaction_state: state,
          },
          delay: 30000,
          jobId: `requery:${transaction._id.toString()}`,
        });
      }
      await transaction.save();
      await redisConnection.setex(
        cacheKey,
        60,
        JSON.stringify({
          status: "fail",
          success: false,
          message: response.message,
          data: { transaction },
          transaction_state: state,
          cached: true,
        }),
      );

      return res.status(HTTPStatus.OK).json({
        status: "fail",
        success: false,
        message: response.message,
        data: { transaction },
        cached: false,
        transaction_state: state,
      });
    }
    await redisConnection.setex(
      cacheKey,
      600,
      JSON.stringify({
        status: "success",
        success: true,
        message: response.result.message,
        data: { ...resultData, transaction },
        transaction_state: {
          status: TransactionStatus.COMPLETED,
          retry: false,
          TTR: 0,
          reason: "Vend Successful",
        },
        cached: true,
      }),
    );

    if (transaction.status !== TransactionStatus.COMPLETED) {
      const state = updateTransaction(response);
      transaction.status = state.status;
      transaction.metadata = response.data;
      transaction.save();
    }
    console.log(`Cache set for transaction ${id} (expires in 60s)`);
    return res.status(HTTPStatus.OK).json({
      status: "success",
      success: true,
      message: response.result.message,
      data: { ...resultData, transaction },
      cached: false,
      transaction_state: {
        status: TransactionStatus.COMPLETED,
        retry: false,
        TTR: 0,
        reason: "Vend Successful",
      },
    });
  } catch (error: any) {
    next(error);
  }
}

export default reQueryHandler;
