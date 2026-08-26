import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { SystemInfoModel } from "../../../models/system-info.model";
import { HTTPStatus } from "../../../utils/http.utils";
import { SystemStatus } from "../../../types/system-info.types";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import { NotificationService } from "../../../utils/notification.utils";

async function updateSystemInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { status, message } = req.body;
  const { userId } = getUser(req);
  const notificationService = NotificationService.getInstance();

  try {
    // checks is status is valid
    const isValidStatus = Object.values(SystemStatus).includes(status);

    if (!isValidStatus) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid status",
      });
    }

    // checks if admin has permission to update system info
    await validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN, AdminRole.OPERATOR], // only superadmin and operator can update system info
    });

    const systemInfo = await SystemInfoModel.findOne();

    if (!systemInfo) {
      // create new system info if not exists
      const newSystemInfo = new SystemInfoModel({
        status,
        message,
      });
      await newSystemInfo.save();
    } else {
      systemInfo.status = status;
      systemInfo.message = message;
      await systemInfo.save();
    }

    const blowpayClient = new BlowMoneyClient();

    await blowpayClient.updateSystemStatus({
      status,
      message,
    });

    await notificationService
      .sendToAll({
        title: "System Information Updated",
        message: `System status has been updated to ${status}. ${
          message || ""
        }`,
      })
      .catch((err) => {
        console.error("Unable to send push notification:", err);
      });

    res.status(200).json({
      success: true,
      message: "System info updated successfully",
    });
  } catch (error) {
    next(error);
  }
}
export default updateSystemInfoHandler;
