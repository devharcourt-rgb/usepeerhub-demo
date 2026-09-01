import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { CryptoService } from "../../services/crypto.service";
import { HTTPStatus } from "../../utils/http.utils";

const cryptoService = new CryptoService();

/**
 * User claims a deposit they sent to the shared establishment address.
 * Nothing is credited here — this only records the claim and kicks off
 * automated on-chain verification; the wallet is credited once that
 * verification confirms it (see CryptoService.verifyDeposit).
 */
async function createCryptoDepositHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { cryptoAssetId, amount, txHash } = req.body as {
    cryptoAssetId: string;
    amount: number;
    txHash: string;
  };

  try {
    const deposit = await cryptoService.createDeposit(userId, {
      cryptoAssetId,
      claimedAmount: Number(amount),
      txHash,
    });

    return res.status(HTTPStatus.ACCEPTED).json({
      message: "Deposit claim received and is being verified on-chain",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
}

export default createCryptoDepositHandler;
