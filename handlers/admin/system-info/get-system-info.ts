import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { SystemInfoModel } from "../../../models/system-info.model";

async function getsystemInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);

  try {
    await validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN, AdminRole.OPERATOR],
    });

    const systemInfo = await SystemInfoModel.findOne();

    res.status(200).json({
      message: "System info fetched successfully",
      data: systemInfo,
    });
  } catch (error) {
    next(error);
  }
}
export default getsystemInfoHandler;
