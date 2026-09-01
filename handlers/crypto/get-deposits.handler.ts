import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

async function getCryptoDepositsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);

  try {
    const deposits = await cryptoService.listUserDeposits(userId);

    return res.json({
      message: "Crypto deposits fetched",
      data: deposits,
    });
  } catch (error) {
    next(error);
  }
}

export default getCryptoDepositsHandler;
