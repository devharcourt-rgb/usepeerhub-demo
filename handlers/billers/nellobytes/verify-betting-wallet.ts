import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";
import { getUser } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";

async function verifyBettingWalletHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  const nellobytesClient = new NelloBytesClient();
  const { customerId, bettingCompany } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Your account is not active. Please verify your account",
      );
    }

    const response = await nellobytesClient.verifyBettingWallet({
      customerId,
      bettingCompany,
    });

    return res.json({
      message: "Verification completed",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default verifyBettingWalletHandler;
