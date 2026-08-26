import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import { HTTPStatus } from "../../../utils/http.utils";

export async function checkDiscoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const buyPowerClient = new BuyPowerClient();

  try {
    const response = await buyPowerClient.checkDisco();

    return res.status(HTTPStatus.OK).json({
      message: "Disco status fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export async function providerReliabilityStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const buyPowerClient = new BuyPowerClient();

  try {
    const response = await buyPowerClient.getProvideStatus();

    return res.status(HTTPStatus.OK).json({
      message: "Service Status fetched successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}
