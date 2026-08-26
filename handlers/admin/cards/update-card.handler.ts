import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function updateCardForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const data = req.body;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cards = await blowmoneyClient.updateCard(id, data);

    return res.json({
      message: "updated card",
      data: cards.data,
    });
  } catch (error) {
    next(error);
  }
}
export default updateCardForAdminHandler;
