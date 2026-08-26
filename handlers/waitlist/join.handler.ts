import { NextFunction, Request, Response } from "express";
import { WaitlistModel } from "../../models/waitlist.model";
import { HTTPStatus } from "../../utils/http.utils";
import HTTPException from "../../utils/error.utils";

async function joinWaitlistHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { emailAddress } = req.body;

    await WaitlistModel.create({ emailAddress });

    return res.status(HTTPStatus.OK).json({
      message: "Successfully joined the waitlist",
      data: {},
    });
  } catch (error: any) {
    const isDuplicateKeyError =
      error.cause?.code === 11000 || error.code === 11000;

    if (isDuplicateKeyError) {
      return next(
        new HTTPException(HTTPStatus.CONFLICT, error.message), // uses your schema's custom message
      );
    }
    next(error);
  }
}

export default joinWaitlistHandler;
