import { Request, Response, NextFunction } from "express";
import { BankService } from "../../services/bank.service";

const bankService = new BankService();

async function validateAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { accountNumber, bankCode } = req.body;

  try {
    const account = await bankService.validateBankAccount(
      accountNumber,
      bankCode,
    );

    return res.json({
      message: "Account name validated",
      data: account,
    });
  } catch (error) {
    next(error);
  }
}

export default validateAccountHandler;
