import { NextFunction, Request, Response } from "express";
import { SystemInfoModel } from "../../models/system-info.model";
import { HTTPStatus } from "../../utils/http.utils";

async function getSystemInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const systemInfo = await SystemInfoModel.findOne();

    if (!systemInfo) {
      return res.status(HTTPStatus.NOT_FOUND).json({
        message: "System info not found",
      });
    }

    return res.status(HTTPStatus.OK).json({
      message: "System info retrieved successfully",
      data: systemInfo,
    });
  } catch (error) {
    next(error);
  }
}

export default getSystemInfoHandler;
