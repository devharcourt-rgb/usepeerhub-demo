import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

async function index(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const buyPowerClient = new BuyPowerClient();

  try {
    const {
      provider,
      vertical,
    } = req.query;

    const response = await buyPowerClient.priceList({
      provider: String(provider),
      vertical: String(vertical),
    });

    if (response.error === true) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, response.message);
    }

    return res.status(200).json({
      message: "Product List Fetch",
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default index;
