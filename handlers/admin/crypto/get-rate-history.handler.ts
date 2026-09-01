import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../../services/crypto.service";

const cryptoService = new CryptoService();

async function getCryptoRateHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  try {
    const history = await cryptoService.getRateHistory(id);

    return res.json({
      message: "Rate history fetched",
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

export default getCryptoRateHistoryHandler;
