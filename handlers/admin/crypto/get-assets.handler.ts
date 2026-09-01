import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../../services/crypto.service";

const cryptoService = new CryptoService();

/** All assets, including inactive ones not yet shown to users. */
async function getAdminCryptoAssetsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const assets = await cryptoService.listAllAssets();

    return res.json({
      message: "Crypto assets fetched",
      data: assets,
    });
  } catch (error) {
    next(error);
  }
}

export default getAdminCryptoAssetsHandler;
