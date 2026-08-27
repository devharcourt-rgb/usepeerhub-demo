import { NextFunction, Request, Response } from "express";
import { ElectricityService } from "../../../services/electricity.service";

const electricityService = new ElectricityService();

async function getDiscosHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const discos = await electricityService.fetchDiscos();

    return res.json({
      message: "Discos fetched",
      data: discos,
    });
  } catch (error) {
    next(error);
  }
}

export default getDiscosHandler;
