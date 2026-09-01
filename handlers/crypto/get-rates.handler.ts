import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

/** The rate board users price their deposits against. */
async function getRatesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rates = await cryptoService.listRates();

    return res.json({
      message: "Crypto rates fetched",
      data: rates,
    });
  } catch (error) {
    next(error);
  }
}

export default getRatesHandler;
