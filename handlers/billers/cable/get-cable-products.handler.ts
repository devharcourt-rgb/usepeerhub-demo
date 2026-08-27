import { NextFunction, Request, Response } from "express";
import { CableService } from "../../../services/cable.service";
import { CableTvType } from "../../../lib/nomba/type";

const cableService = new CableService();

async function getCableProductsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { cableTvType } = req.params as { cableTvType: CableTvType };

  try {
    const products = await cableService.fetchProducts(cableTvType);

    return res.json({
      message: "Cable TV products fetched",
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export default getCableProductsHandler;
