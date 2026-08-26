import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getCardForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cards = await blowmoneyClient.getCard(id);

    return res.json({
      status: "fetched card",
      data: cards.data,
    });
  } catch (error) {
    next(error);
  }
}
export default getCardForAdminHandler;
