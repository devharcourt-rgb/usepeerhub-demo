import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NotificationModel } from "../../models/notification.model";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";

async function createNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { subject, message, recipient } = req.body;

  try {
    const isValid = mongoose.isValidObjectId(recipient);

    if (!isValid) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid recipient id");
    }

    const user = await UserModel.findById(recipient);

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Recipient not found");
    }

    const notification = await NotificationModel.create({
      recipient,
      subject,
      message,
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Notification created",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export default createNotificationHandler;
