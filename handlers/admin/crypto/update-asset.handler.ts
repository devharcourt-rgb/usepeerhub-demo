import { NextFunction, Request, Response } from "express";
import { CryptoService } from "../../../services/crypto.service";

const cryptoService = new CryptoService();

async function updateCryptoAssetHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const {
    displayName,
    address,
    contractAddress,
    decimals,
    minDeposit,
    requiredConfirmations,
    active,
  } = req.body;

  try {
    const update: Record<string, unknown> = {};

    if (displayName !== undefined) update.displayName = displayName;
    if (address !== undefined) update.address = address;
    if (contractAddress !== undefined) update.contractAddress = contractAddress;
    if (decimals !== undefined) update.decimals = Number(decimals);
    if (minDeposit !== undefined) update.minDeposit = Number(minDeposit);
    if (requiredConfirmations !== undefined)
      update.requiredConfirmations = Number(requiredConfirmations);
    if (active !== undefined) update.active = Boolean(active);

    const asset = await cryptoService.updateAsset(id, update);

    return res.json({
      message: "Crypto asset updated",
      data: asset,
    });
  } catch (error) {
    next(error);
  }
}

export default updateCryptoAssetHandler;
