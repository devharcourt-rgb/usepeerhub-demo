import { NextFunction, Request, Response } from "express";
import { BlackListModel } from "../models/black-list";

export const blockIPMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = (req.ip || req.connection.remoteAddress)?.replace("::ffff:", "");

    const blackList = await BlackListModel.find().select("ip -_id").lean();
    const blockedIPs = blackList.map((entry) => entry.ip);

    if (blockedIPs.includes(ip!.toString())) {
      return res.status(403).json({ message: "Access denied from your IP." });
    }

    next();
  } catch (error) {
    console.error("Error checking blacklist:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
