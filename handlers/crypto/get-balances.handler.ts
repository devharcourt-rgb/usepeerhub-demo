import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

/**
 * The user's balance across every active crypto asset — always includes
 * every asset, defaulting to 0 if the user has no completed deposits for
 * it — plus each balance's NGN and USD equivalent at current rates.
 */
async function getCryptoBalancesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);

  try {
    const balances = await cryptoService.getUserBalances(userId);

    return res.json({
      message: "Crypto balances fetched",
      data: balances,
    });
  } catch (error) {
    next(error);
  }
}

export default getCryptoBalancesHandler;
