import { NextFunction, Request, Response } from "express";
import { CustomSession } from "../utils/session.utils";
import { HTTPStatus } from "../utils/http.utils";

async function adminProtect(req: Request, res: Response, next: NextFunction) {
  const { userId, role } = req.session as CustomSession;

  if (!userId || role !== "admin") {
    return res.status(HTTPStatus.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
  }

  next();
}

export default adminProtect;
