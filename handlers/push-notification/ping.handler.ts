import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../../utils/notification.utils";

const notificationService = NotificationService.getInstance();

async function pingDeviceHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await notificationService.sendToAll({
      title: "Ping",
      message: "This is a ping message",
    });
    res.status(200).json({ message: "Device ping successfully" });
  } catch (error: any) {
    next(error);
    return;
  }
}

export default pingDeviceHandler;
