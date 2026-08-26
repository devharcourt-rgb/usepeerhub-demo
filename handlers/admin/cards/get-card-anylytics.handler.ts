import { NextFunction, Request, Response } from "express";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getCardAnalyticsForAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    const cardAnalytics = await blowmoneyClient.getCardAnalytics(id);

    return res.json({
      status: "fetched card analytics",
      data: cardAnalytics,
    });
  } catch (error) {
    next(error);
  }
}
export default getCardAnalyticsForAdminHandler;
