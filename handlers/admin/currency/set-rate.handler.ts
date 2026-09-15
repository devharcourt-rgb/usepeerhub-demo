import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { CurrencyService } from "../../../services/currency.service";

const currencyService = new CurrencyService();

async function setCurrencyRateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { code } = req.params;
  const { rateToNGN } = req.body;

  try {
    const currency = await currencyService.setRateToNGN(
      code.toUpperCase(),
      Number(rateToNGN),
      userId,
    );

    return res.json({
      message: "Rate updated",
      data: currency,
    });
  } catch (error) {
    next(error);
  }
}

export default setCurrencyRateHandler;
