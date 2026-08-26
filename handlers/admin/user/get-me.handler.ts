import { NextFunction, Request, Response } from "express";
import { AdminModel } from "../../../models/admin.model";
import { getUser, sensitiveFields } from "../../../utils/core.utils";

async function getMeHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  try {
    const user = await AdminModel.findById(userId).select(sensitiveFields);

    return res.status(200).json({
      message: "fetched user",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default getMeHandlerForAdmin;
