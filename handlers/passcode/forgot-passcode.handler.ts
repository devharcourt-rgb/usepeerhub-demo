import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { getUser } from "../../utils/core.utils";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";

async function forgotPasscodeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.UNAUTHORIZED, "User not found");
    }

    const otp = await user.generateOTP();

    // Add job to queue
    queueProducer.addJob({
      name: "send-passcode-reset-email",
      data: {
        otp: otp,
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    return res.json({
      message: "Passcode reset instructions sent",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default forgotPasscodeHandler;
