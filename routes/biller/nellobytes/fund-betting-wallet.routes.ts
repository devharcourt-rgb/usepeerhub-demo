import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import fundBettingWalletHandler from "../../../handlers/billers/nellobytes/fund-betting-wallet";

const router = express.Router();

const validateRequest = () => {
  return [
    body("customerId").notEmpty().withMessage("Customer id is required"),
    body("bettingCompany")
      .notEmpty()
      .withMessage("Betting commpany is required"),
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

router.post(
  "/fund-wallet",
  protect,
  validateRequest(),
  fundBettingWalletHandler
);

export default router;
