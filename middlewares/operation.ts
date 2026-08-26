import { NextFunction, Request, Response } from "express";
import { SystemInfoModel } from "../models/system-info.model";
import { SystemStatus } from "../types/system-info.types";

async function operationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const systemInfo = await SystemInfoModel.findOne({}).exec();

  if (!systemInfo) {
    return res.status(500).json({
      message: "System information not found",
    });
  }

  const systemOperational: boolean =
    systemInfo.status === SystemStatus.OPERATIONAL ? true : false;

  if (!systemOperational) {
    return res.status(503).json({
      message: "System is currently not operational",
    });
  }
  next();
}

export default operationMiddleware;
