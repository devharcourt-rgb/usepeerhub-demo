import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";
import { VirtualAccountType } from "../../types/virtual-account.type";
import { VirtualAccountModel } from "../../models/virtual-account";

async function getVirtualAccountSourceHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { type = VirtualAccountType.INTERNAL } = req.query;

  try {
    const query: Record<string, any> = {
      user: new mongoose.Types.ObjectId(userId),
      type,
    };

    let virtualAccount;
    virtualAccount = await VirtualAccountModel.find({
      ...query,
    }).populate("user currency");

    return res.json({
      message: "Virtual account fetched-f",
      data: virtualAccount,
    });
  } catch (error) {
    next(error);
  }
}

export default getVirtualAccountSourceHandler;
