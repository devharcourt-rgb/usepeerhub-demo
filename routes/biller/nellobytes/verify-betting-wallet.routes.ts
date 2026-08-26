import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import verifyBettingWalletHandler from "../../../handlers/billers/nellobytes/verify-betting-wallet";

const router = express.Router();

const validateRequest = () => {
  return [
    body("customerId").notEmpty().withMessage("Customer id is required"),
    body("bettingCompany")
      .notEmpty()
      .withMessage("Betting commpany is required"),
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
  "/verify-betting-wallet",
  protect,
  validateRequest(),
  verifyBettingWalletHandler
);

export default router;
