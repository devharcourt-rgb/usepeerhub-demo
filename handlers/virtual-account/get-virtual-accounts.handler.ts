import { NextFunction, Request, Response } from "express";
import { VirtualAccountModel } from "../../models/virtual-account";
import { getVirtualAccountsPipeline } from "./pipelines/get-virtual-accounts.pipeline";

async function getVirtualAccountsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { accountNumber, phoneNumber, username } = req.query;

  const query: Record<string, any> = {};

  if (accountNumber) {
    query.accountNumber = accountNumber;
  }

  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  }

  if (username) {
    query.username = username;
  }

  try {
    const aggregation = getVirtualAccountsPipeline({ query });

    const virtualAccounts = await VirtualAccountModel.aggregate(aggregation);

    return res.json({
      message: "Virtual account fetched",
      data: virtualAccounts,
    });
  } catch (error) {
    next(error);
  }
}

export default getVirtualAccountsHandler;
