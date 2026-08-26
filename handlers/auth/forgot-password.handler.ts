import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { AccountStatus } from "../../types/user.types";
import { UserModel } from "../../models/user.model";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";
import redisConnection from "../../config/redis";
import QueueProducer from "../../queue/producer";

async function forgotPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { emailAddress } = req.body;

  try {
    const queueProducer = new QueueProducer(
      redisConnection,
      DEFAULT_REDIS_QUEUE,
    );

    const user = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    }).select("-password -tokenExpire");

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "account not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "account not active. Please verify account",
      );
    }
    const otp = await user.generateOTP();

    // Add job to queue
    queueProducer.addJob({
      name: "send-forgot-password-email",
      data: {
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        otp: otp,
        id: user.id,
      },
    });

    return res.json({
      message: "Email sent",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default forgotPasswordHandler;
