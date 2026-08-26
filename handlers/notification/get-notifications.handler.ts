import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";
import { NotificationModel } from "../../models/notification.model";

async function getNotificationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);

  try {
    const notifications = await NotificationModel.find({
      recipient: new mongoose.Types.ObjectId(userId),
    });

    return res.json({
      message: "Notifications fetched",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export default getNotificationsHandler;
