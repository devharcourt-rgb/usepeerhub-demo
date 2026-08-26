import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";
import { NotificationModel } from "../../models/notification.model";
import { NotificationStatus } from "../../types/notification.types";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";

async function updateNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;
  const { status } = req.body;

  try {
    const isValid = Object.values(NotificationStatus).includes(status);

    if (!isValid) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid status");
    }

    const notification = await NotificationModel.findOneAndUpdate(
      {
        recipient: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "Notification not found");
    }

    return res.json({
      message: "Notification updated",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export default updateNotificationHandler;
