import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

/** The catalog users see: shared deposit address + current rate per asset. */
async function getChainsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const assets = await cryptoService.listAllAssets();

    return res.json({
      message: "Crypto chains fetched",
      data: assets,
    });
  } catch (error) {
    next(error);
  }
}

export default getChainsHandler;
