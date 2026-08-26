import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";
import { NotificationModel } from "../../models/notification.model";

async function getSingleNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  try {
    const notification = await NotificationModel.findOne({
      recipient: new mongoose.Types.ObjectId(userId),
      _id: new mongoose.Types.ObjectId(id),
    });

    return res.json({
      message: "Notification fetched",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export default getSingleNotificationHandler;
