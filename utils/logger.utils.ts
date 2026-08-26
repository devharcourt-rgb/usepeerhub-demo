// utils/logger.utils.ts
import { NextFunction, Request, Response } from "express";
import winston from "winston";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Log to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Log errors to a separate file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // Log all output to another file
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Add request context middleware for Express
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as any).requestId = require("uuid").v4();
  logger.child({ requestId: (req as any).requestId }).info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
  });
  next();
};

export default logger;
