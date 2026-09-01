import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

/** The catalog users see: shared deposit address + current rate per asset. */
async function getCryptoAssetsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { active } = req.query;

  let filter: { active?: boolean } = {};

  if (active !== undefined) {
    filter.active = active === "true";
  }
  try {
    const assets = await cryptoService.listActiveAssets(filter);

    return res.json({
      message: "Crypto assets fetched",
      data: assets,
    });
  } catch (error) {
    next(error);
  }
}

export default getCryptoAssetsHandler;
