import { NextFunction, Request, Response } from "express";
import { getUser, sanitizeUserUpdateData } from "../../utils/core.utils";
import mongoose from "mongoose";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";

async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);

  try {
    const data = await sanitizeUserUpdateData(req.body);

    const user = await UserModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      data,
      {
        new: true,
      },
    );

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
    }

    return res.json({
      message: "User profile updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default updateUserHandler;
