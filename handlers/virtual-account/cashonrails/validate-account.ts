import { Request, Response, NextFunction } from "express";
import { validateAccountName } from "../../../services/cashonrails.service";

async function validateAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { accountNumber, bankCode } = req.body;
  try {
    const apiResponse = await validateAccountName(accountNumber, bankCode);

    return res.json({
      message: "Account name validated",
      data: apiResponse,
    });
  } catch (error) {
    next(error);
  }
}

export default validateAccountHandler;
