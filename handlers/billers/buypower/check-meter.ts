import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

async function checkMeterHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const buyPowerClient = new BuyPowerClient();

  try {
    const {
      meter,
      disco,
      vendType = "PREPAID",
      vertical = "ELECTRICITY",
      orderId = false,
    } = req.body;

    const response = await buyPowerClient.checkMeter({
      meter,
      disco,
      vendType,
      vertical,
      orderId,
    });

    if (response.error === true) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, response.message);
    }

    return res.status(200).json({
      message: "Meter checked successfully",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default checkMeterHandler;
