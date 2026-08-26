import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { sensitiveFields } from "../../utils/core.utils";

async function getUserHandler(req: Request, res: Response, next: NextFunction) {
  const { id } = req.query;
  try {
    const user = await UserModel.findById(id).select(sensitiveFields);

    return res.status(200).json({
      message: "fetched user",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default getUserHandler;
