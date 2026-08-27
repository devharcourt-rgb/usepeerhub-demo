import { Request, Response, NextFunction } from "express";
import { BankService } from "../../services/bank.service";

const bankService = new BankService();

async function getBankListHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const banks = await bankService.getBankList();

    return res.json({
      message: "Bank list fetched",
      data: banks,
    });
  } catch (error) {
    next(error);
  }
}

export default getBankListHandler;
