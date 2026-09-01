import { NextFunction, Request, Response } from "express";
import { getUser } from "../../../utils/core.utils";
import { CryptoService } from "../../../services/crypto.service";

const cryptoService = new CryptoService();

async function setCryptoRateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { id } = req.params;
  const { rateToNGN } = req.body;

  try {
    const asset = await cryptoService.setRate(id, Number(rateToNGN), userId);

    return res.json({
      message: "Rate updated",
      data: asset,
    });
  } catch (error) {
    next(error);
  }
}

export default setCryptoRateHandler;
