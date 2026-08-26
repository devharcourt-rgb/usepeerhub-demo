import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import mongoose from "mongoose";
import { VirtualAccountType } from "../../types/virtual-account.type";
import { VirtualAccountModel } from "../../models/virtual-account";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";

async function getVirtualAccountHandler(
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

    if (req.path !== "/source") {
      virtualAccount = await VirtualAccountModel.findOne(query).populate(
        "user currency"
      );

      if (!virtualAccount) {
        throw new HTTPException(
          HTTPStatus.NOT_FOUND,
          "Virtual account not found"
        );
      }
    } else if (req.url == "/source") {
      virtualAccount = await VirtualAccountModel.find(query).populate(
        "user currency"
      );

      if (virtualAccount.length === 0) {
        // throw new HTTPException(
        //   HTTPStatus.NOT_FOUND,
        //   "Virtual account not found"
        // );
        res.json({
          message: "Virtual account fetched-f",
          data: virtualAccount,
        });
      }
      return;
    } else {
      virtualAccount = await VirtualAccountModel.find({
        ...query,
        source: req.query.name,
      }).populate("user currency");

      if (virtualAccount.length === 0) {
        throw new HTTPException(
          HTTPStatus.NOT_FOUND,
          "Virtuals account not found"
        );
      }
    }

    return res.json({
      message: "Virtual account fetched-f",
      data: virtualAccount,
    });
  } catch (error) {
    next(error);
  }
}

export default getVirtualAccountHandler;
