import { Request, Response, NextFunction } from "express";
import { getUser } from "../../utils/core.utils";
import { NotificationService } from "../../utils/notification.utils";

const notificationService = NotificationService.getInstance();

async function setDeviceTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { token, platform = "Mobile app", source = "firebase" } = req.body;
  const { userId } = getUser(req);
  try {
    const existingDevice = await notificationService.findDevice(token, userId);

    if (existingDevice) {
      return res.json({
        message: "Token already registered",
        data: {},
      });
    }

    await notificationService.registerDeviceToken(
      userId,
      token,
      platform,
      source,
    );

    res.json({
      message: "Token registered",
      data: {},
    });
    return;
  } catch (error: any) {
    next(error);
    return;
  }
}

export default setDeviceTokenHandler;
