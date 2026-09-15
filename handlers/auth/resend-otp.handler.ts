import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";
import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";

async function resendOtpHandler(
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
    }).select("-password");

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "account not found");
    }

    var otp = await user.generateOTP();

    // Add job to queue
    queueProducer.addJob({
      name: "send-otp-email",
      data: {
        otp: otp,
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
      },
    });

    return res.json({
      message: "Otp generated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default resendOtpHandler;
