import express from "express";
import protect from "../../../middlewares/auth";
import { query, validationResult } from "express-validator";
import lookupCableCustomerHandler from "../../../handlers/billers/cable/lookup-cable-customer.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    query("cableTvType")
      .isIn(["dstv", "gotv", "startimes", "ShowMax"])
      .withMessage("cableTvType must be one of dstv, gotv, startimes, ShowMax"),
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
 * @description Resolve a smart card / IUC number to the customer's name.
 * @route GET /api/billers/nomba/cable/lookup
 * @access Private
 * @method GET
 */
router.get(
  "/cable/lookup",
  protect,
  validateRequest(),
  lookupCableCustomerHandler,
);

export default router;
