import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateBettingHandler from "../../../handlers/billers/betting/validate-betting.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("providerId").notEmpty().withMessage("Provider ID is required"),
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("amount")
      .isFloat({ min: 50 })
      .withMessage("Amount must be at least 50"),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Resolve the betting account and check the account is active
 * and the wallet has enough balance, without charging or funding.
 * @route POST /api/billers/nomba/betting/validate
 * @access Private
 * @method POST
 */
router.post(
  "/betting/validate",
  protect,
  validateRequest(),
  validateBettingHandler,
);

export default router;
