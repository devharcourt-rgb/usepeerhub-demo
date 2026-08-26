import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getAllCardsForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { page = 1, limit = 10, search } = req.query;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cards = await blowmoneyClient.getAllCards({
      page: parseInt(page.toString()),
      limit: parseInt(limit.toString()),
      ...(search && typeof search === "string" && { search }),
    });

    return res.json({
      status: "fetched all cards",
      data: cards.data,
    });
  } catch (error) {
    next(error);
  }
}
export default getAllCardsForAdminHandler;
