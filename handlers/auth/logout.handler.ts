import { NextFunction, Request, Response } from "express";
import { logout } from "../../utils/core.utils";

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const msg = await logout(req, res);

    return res.json({ message: msg });
  } catch (error) {
    next(error);
  }
}

export default logoutHandler;
