import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";

async function getElectricityDiscosHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();

  try {
    const response = await nellobytesClient.getElectricityDiscos();

    return res.json({
      message: "Discos fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default getElectricityDiscosHandler;
