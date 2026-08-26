import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function activateCardForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cards = await blowmoneyClient.activateCard(id);

    return res.json({
      status: "card activated",
      data: cards.data,
    });
  } catch (error) {
    next(error);
  }
}
export default activateCardForAdminHandler;
