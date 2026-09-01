import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../../services/crypto.service";
import { HTTPStatus } from "../../../utils/http.utils";

const cryptoService = new CryptoService();

/**
 * Registers a new crypto asset. Created inactive — set the real deposit
 * address and a rate, then flip it active via PATCH once it looks right.
 */
async function createCryptoAssetHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const {
    symbol,
    network,
    standard,
    displayName,
    address,
    contractAddress,
    decimals,
    minDeposit,
    requiredConfirmations,
  } = req.body;

  try {
    const asset = await cryptoService.createAsset({
      symbol,
      network,
      standard,
      displayName,
      address,
      contractAddress,
      decimals: Number(decimals),
      minDeposit: minDeposit !== undefined ? Number(minDeposit) : undefined,
      requiredConfirmations: Number(requiredConfirmations),
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Crypto asset created",
      data: asset,
    });
  } catch (error) {
    next(error);
  }
}

export default createCryptoAssetHandler;
