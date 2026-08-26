import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { VirtualAccountModel } from "../../../models/virtual-account";
import { HTTPStatus } from "../../../utils/http.utils";
import mongoose from "mongoose";
import { APP_NAME } from "../transactions/get-transactions.handler";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import HTTPException from "../../../utils/error.utils";
import moment from "moment";

async function getVirtualAccountsHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    page = 0,
    limit = 10,
    sort = "createdAt:desc",
    user,
    app = APP_NAME.BOTH,
    startDate = moment().startOf("month").toISOString(),
    endDate = moment().endOf("month").toISOString(),
  } = req.query;
  const { userId } = getUser(req);

  const skip = Number(page) * Number(limit);

  const query: Record<string, any> = {};

  if (user) {
    query.user = new mongoose.Types.ObjectId(user as string);
  }

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate.toString()),
      $lte: new Date(endDate.toString()),
    };
  }

  const sortBy = sort.toString().split(":")[0];
  const sortOrder = sort.toString().split(":")[1];

  try {
    const blowmoneyClient = new BlowMoneyClient();

    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let virtualAccounts;

    switch (app) {
      case APP_NAME.BLOWPAY:
        virtualAccounts = await VirtualAccountModel.find(query)
          .populate({ path: "user", select: "firstName lastName emailAddress" })
          .populate("currency")
          .skip(skip)
          .limit(Number(limit))
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });
        break;

      case APP_NAME.BLOWMONEY:
        const response = await blowmoneyClient.getVirtualAccounts({
          skip,
          limit: Number(limit),
          query,
        });

        virtualAccounts = response.data;
        break;

      case APP_NAME.BOTH:
        const blowpayVirtualAccounts = await VirtualAccountModel.find(query)
          .populate({ path: "user", select: "firstName lastName emailAddress" })
          .skip(skip)
          .limit(Number(limit));

        const blowmoneyVirtualAccounts =
          await blowmoneyClient.getVirtualAccounts({
            skip,
            limit: Number(limit),
            query,
          });

        virtualAccounts = [
          ...blowpayVirtualAccounts,
          ...blowmoneyVirtualAccounts.data,
        ];

        // order by createdAt
        virtualAccounts.sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        break;

      default:
        throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid app name");
    }

    return res.status(HTTPStatus.OK).json({
      message: "virual accounts",
      data: virtualAccounts,
    });
  } catch (error) {
    next(error);
  }
}

export default getVirtualAccountsHandlerForAdmin;
