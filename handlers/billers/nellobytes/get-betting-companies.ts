import { NextFunction, Request, Response } from "express";
import { NelloBytesClient } from "../../../lib/nellobytes";
import { HTTPStatus } from "../../../utils/http.utils";

async function getBettingCompainesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nellobytesClient = new NelloBytesClient();
  try {
    const response = await nellobytesClient.getBettingCompaines();

    return res.status(HTTPStatus.OK).json({
      message: "Betting companies fetched successfully",
      data: response["BETTING_COMPANY"] || response,
    });
  } catch (error) {
    next(error);
  }
}

export default getBettingCompainesHandler;
