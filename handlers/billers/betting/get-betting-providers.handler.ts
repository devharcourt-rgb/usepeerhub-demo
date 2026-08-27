import { NextFunction, Request, Response } from "express";
import { BettingService } from "../../../services/betting.service";

const bettingService = new BettingService();

async function getBettingProvidersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const providers = await bettingService.fetchProviders();

    return res.json({
      message: "Betting providers fetched",
      data: providers,
    });
  } catch (error) {
    next(error);
  }
}

export default getBettingProvidersHandler;
