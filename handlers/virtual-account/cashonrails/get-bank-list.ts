import { Request, Response, NextFunction } from "express";
import { getBankList } from "../../../services/cashonrails.service";

async function getBankListHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const apiResponse = await getBankList();

    return res.json({
      message: "Bank list fetched",
      data: apiResponse,
    });
  } catch (error) {
    next(error);
  }
}

export default getBankListHandler;
