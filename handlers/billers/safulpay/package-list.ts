import { NextFunction, Request, Response } from "express";
import { SafulPayClient } from "../../../lib/safulpay";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

async function getSafulpayPackageListHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const safulpayClient = new SafulPayClient();

  try {
    const response = await safulpayClient.getPackageList();

    if (response.success !== true || !response.data) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Failed to fetch package list from SafulPay"
      );
    }

    return res.json({
      message: "Package list fetched",
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
}

export default getSafulpayPackageListHandler;
