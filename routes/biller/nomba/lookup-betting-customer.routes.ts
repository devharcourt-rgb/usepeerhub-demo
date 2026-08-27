import express from "express";
import protect from "../../../middlewares/auth";
import { query, validationResult } from "express-validator";
import lookupBettingCustomerHandler from "../../../handlers/billers/betting/lookup-betting-customer.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    query("providerId").notEmpty().withMessage("Provider ID is required"),
    query("customerId").notEmpty().withMessage("Customer ID is required"),
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
 * @description Resolve a betting account customer ID to the customer's name.
 * @route GET /api/billers/nomba/betting/lookup
 * @access Private
 * @method GET
 */
router.get(
  "/betting/lookup",
  protect,
  validateRequest(),
  lookupBettingCustomerHandler,
);

export default router;
