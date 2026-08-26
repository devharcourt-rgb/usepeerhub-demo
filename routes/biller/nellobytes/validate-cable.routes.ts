import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateCableHandler from "../../../handlers/billers/nellobytes/valiate-cable.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("cableTv").notEmpty().withMessage("Electric company is required"),
    body("smartCardNo").notEmpty().withMessage("Smart card no is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        next(errors.array());
      }

      next();
    },
  ];
};

router.post(
  "/cable/validate",
  protect,
  validateRequest(),
  validateCableHandler
);

export default router;
