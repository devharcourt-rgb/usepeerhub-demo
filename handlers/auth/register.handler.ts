import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import QueueProducer from "../../queue/producer";
import redisConnection from "../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../global/queue";
import { UserModel } from "../../models/user.model";
import { db } from "../../config/database";
import { validateSignupEmail } from "../../utils/security.utils";

async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { firstName, lastName, emailAddress, password, username } = req.body;
  const session = await db.startSession();
  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    session.startTransaction();

    const existingAccount = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    }).select("-password -otp -otpExpire");

    // User with email already exists
    if (existingAccount) {
      throw new HTTPException(HTTPStatus.CONFLICT, "account already exists");
    }

    const auditResult = await validateSignupEmail(emailAddress, UserModel);

    if (auditResult.allowed) {
      const user = await UserModel.create({
        firstName,
        lastName,
        emailAddress,
        password,
        ...(username
          ? { username: username.toLowerCase().replaceAll(" ", "") }
          : {
              username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
            }),
      });

      const otp = await user.generateOTP();

      // Two separate emails: a plain welcome/onboarding message, and the
      // OTP the user actually needs to verify their address.
      queueProducer.addJob({
        name: "send-welcome-email",
        data: {
          recipientEmail: user.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      queueProducer.addJob({
        name: "send-otp-email",
        data: {
          otp: otp,
          recipientEmail: user.emailAddress,
          firstName: user.firstName,
        },
      });

      await session.commitTransaction();

      return res.status(HTTPStatus.CREATED).json({
        message: "Account created",
        data: user,
      });
    }
  } catch (error) {
    await session.abortTransaction(); // Abort only if it hasn't been aborted yet
    next(error);
  } finally {
    await session.endSession();
  }
}

export default registerHandler;
