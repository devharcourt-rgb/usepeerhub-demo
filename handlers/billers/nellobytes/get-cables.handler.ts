import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";

async function getCablesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();

  try {
    const response = await nellobytesClient.getCables();

    return res.json({
      message: "Cables fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default getCablesHandler;
