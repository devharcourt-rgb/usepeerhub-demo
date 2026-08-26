import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { AccountStatus } from "../../types/user.types";
import { UserModel } from "../../models/user.model";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";
import redisConnection from "../../config/redis";
import QueueProducer from "../../queue/producer";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";

async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { oldPassword, newPassword } = req.body;

  try {
    const queueProducer = new QueueProducer(
      redisConnection,
      DEFAULT_REDIS_QUEUE,
    );

    const user = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    }).select("-tokenExpire");

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "account not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "account not active. Please verify account",
      );
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Old password is incorrect",
      );
    }

    user.password = newPassword;
    await user.save();

    // Add job to queue
    queueProducer.addJob({
      name: "send-change-password-email",
      data: {
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    return res.json({
      message: "Password changed",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default changePasswordHandler;
