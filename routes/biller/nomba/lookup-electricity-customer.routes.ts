import express from "express";
import protect from "../../../middlewares/auth";
import { query, validationResult } from "express-validator";
import lookupElectricityCustomerHandler from "../../../handlers/billers/electricity/lookup-electricity-customer.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    query("disco").notEmpty().withMessage("Disco is required"),
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
 * @description Resolve a meter / customer number to the customer's name.
 * @route GET /api/billers/nomba/electricity/lookup
 * @access Private
 * @method GET
 */
router.get(
  "/electricity/lookup",
  protect,
  validateRequest(),
  lookupElectricityCustomerHandler,
);

export default router;
