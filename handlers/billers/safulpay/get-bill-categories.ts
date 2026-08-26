import { NextFunction, Request, Response } from "express";
import { SafulPayBillCategory } from "../../../lib/safulpay/interface";

async function getSafulpayBillCategoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = Object.values(SafulPayBillCategory);

    return res.json({
      message: "Bill categories fetched",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export default getSafulpayBillCategoriesHandler;
