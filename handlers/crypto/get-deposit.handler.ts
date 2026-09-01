import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

async function getCryptoDepositHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  try {
    const deposit = await cryptoService.getUserDeposit(userId, id);

    return res.json({
      message: "Crypto deposit fetched",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
}

export default getCryptoDepositHandler;
