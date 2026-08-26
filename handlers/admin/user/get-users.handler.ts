import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../../models/user.model";

async function getUsersHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await UserModel.find({}).select("-password");

    return res.status(200).json({
      message: "fetched users",
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export default getUsersHandlerForAdmin;
