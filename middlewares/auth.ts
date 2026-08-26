import { NextFunction, Request, Response } from "express";
import { CustomSession } from "../utils/session.utils";
import { HTTPStatus } from "../utils/http.utils";

async function protect(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.session as CustomSession;

  if (!userId) {
    return res.status(HTTPStatus.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
  }

  next();
}

export default protect;
