import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../../services/crypto.service";

const cryptoService = new CryptoService();

/** The "who sent what" view — every deposit claim, filterable by status/user/asset. */
async function getAdminCryptoDepositsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { status, userId, cryptoAssetId } = req.query as {
    status?: string;
    userId?: string;
    cryptoAssetId?: string;
  };

  try {
    const deposits = await cryptoService.listAllDeposits({
      status,
      userId,
      cryptoAssetId,
    });

    return res.json({
      message: "Crypto deposits fetched",
      data: deposits,
    });
  } catch (error) {
    next(error);
  }
}

export default getAdminCryptoDepositsHandler;
