import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function blockCardForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cards = await blowmoneyClient.blockCard(id);

    return res.json({
      status: "card blocked",
      data: cards.data,
    });
  } catch (error) {
    next(error);
  }
}
export default blockCardForAdminHandler;
