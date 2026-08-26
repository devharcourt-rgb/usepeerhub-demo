import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import protect from "../../../middlewares/auth";
import validateSafulpayOutflowDetailHandler from "../../../handlers/billers/safulpay/validate-details";

const router = express.Router();

const validateRequest = () => {
  return [
    body("amount").optional(),
    body("category").optional(),
    body("recipient").optional(),
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
  "/validate",
  protect,
  validateRequest(),
  validateSafulpayOutflowDetailHandler
);

export default router;
