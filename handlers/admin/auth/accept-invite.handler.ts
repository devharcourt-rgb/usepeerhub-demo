import { NextFunction, Request, Response } from "express";
import { AdminModel } from "../../../models/admin.model";
import { AccountStatus } from "../../../types/user.types";
import { HTTPStatus } from "../../../utils/http.utils";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";

async function acceptInviteHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { user } = req.query;
  const { firstName, lastName, password } = req.body;

  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    // checks if admin exists. That means that the admin was invited
    const admin = await AdminModel.findById(user);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // checks if admin is already active
    if (admin.status === AccountStatus.active) {
      return res.status(400).json({
        message: "Admin already active",
      });
    }

    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.password = password;
    admin.status = AccountStatus.inactive;

    await admin.save();

    const otp = await admin.generateOTP();

    // Add job to queue
    queueProducer.addJob({
      name: "send-admin-welcome-email",
      data: {
        otp: otp,
        recipientEmail: admin.emailAddress,
        firstName: admin.firstName,
        lastName: admin.firstName,
      },
    });

    return res.status(HTTPStatus.OK).json({
      message: "Admin accepted invitation",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default acceptInviteHandler;
