import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import buyElectricityHandler from "../../../handlers/billers/nellobytes/create-order.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("electricCompany")
      .notEmpty()
      .withMessage("Electric company is required"),
    body("meterNo").notEmpty().withMessage("Meter no is required"),
    body("meterType").notEmpty().withMessage("Meter type is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        next(errors.array());
      }

      next();
    },
  ];
};

router.post("/create-order", protect, validateRequest(), buyElectricityHandler);

export default router;
