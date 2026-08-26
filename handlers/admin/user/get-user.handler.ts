import { NextFunction, Request, Response } from "express";
import { AdminModel } from "../../../models/admin.model";
import { sensitiveFields } from "../../../utils/core.utils";

async function getUserHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  try {
    const user = await AdminModel.findById(id).select(sensitiveFields);

    return res.status(200).json({
      message: "fetched user",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default getUserHandlerForAdmin;
