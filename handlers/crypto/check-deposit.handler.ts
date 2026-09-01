import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { CryptoService } from "../../services/crypto.service";

const cryptoService = new CryptoService();

/** Lets the client force an immediate re-check instead of waiting for the background job's next tick. */
async function checkCryptoDepositHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  try {
    // Ownership check first — verifyDeposit itself is user-agnostic.
    await cryptoService.getUserDeposit(userId, id);

    const { deposit } = await cryptoService.verifyDeposit(id);

    return res.json({
      message: "Deposit status checked",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
}

export default checkCryptoDepositHandler;
