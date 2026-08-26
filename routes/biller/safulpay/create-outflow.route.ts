import express, { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import createSafulpayOutpayHandler from "../../../handlers/billers/safulpay/create-outflow";
import protect from "../../../middlewares/auth";

const router = express.Router();

const validateRequest = () => {
  return [
    body("amount").notEmpty().withMessage("amount is required"),
    body("category").notEmpty().withMessage("category is required"),
    body("recipient").notEmpty().withMessage("recipient is required"),
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
  "/outflow",
  protect,
  validateRequest(),
  createSafulpayOutpayHandler
);

export default router;
