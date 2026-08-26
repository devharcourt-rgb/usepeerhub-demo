import { NextFunction, Request, Response } from "express";
import HTTPException from "../utils/error.utils";

function errorMiddleware(
  err: HTTPException | Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HTTPException) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }

  // every other type of error
  return res.status(500).json({ error: err });
}

export default errorMiddleware;
