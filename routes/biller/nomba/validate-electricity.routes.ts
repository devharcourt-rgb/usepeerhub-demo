import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateElectricityHandler from "../../../handlers/billers/electricity/validate-electricity.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("disco").notEmpty().withMessage("Disco is required"),
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("meterType")
      .isIn(["prepaid", "postpaid"])
      .withMessage("meterType must be one of prepaid, postpaid"),
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
 * @description Resolve the meter / customer number and check the account
 * is active and the wallet has enough balance, without charging or
 * vending.
 * @route POST /api/billers/nomba/electricity/validate
 * @access Private
 * @method POST
 */
router.post(
  "/electricity/validate",
  protect,
  validateRequest(),
  validateElectricityHandler,
);

export default router;
