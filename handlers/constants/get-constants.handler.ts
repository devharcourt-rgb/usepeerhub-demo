import { NextFunction, Request, Response } from "express";
import { HTTPStatus } from "../../utils/http.utils";

async function getConstantsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(HTTPStatus.OK).json({
      message: "Constants fetched successfully",
      data: {
        phoneNumber: "+234 810 748 1175",
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getConstantsHandler;
