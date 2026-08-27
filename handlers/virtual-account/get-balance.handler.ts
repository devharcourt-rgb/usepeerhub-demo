import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { VirtualAccountService } from "../../services/virtualAccount.service";

const virtualAccountService = new VirtualAccountService();

async function getBalanceHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);

  try {
    const balance = await virtualAccountService.getBalanceForUser(userId);

    return res.json({
      message: "Balance fetched",
      data: balance,
    });
  } catch (error) {
    next(error);
  }
}

export default getBalanceHandler;
