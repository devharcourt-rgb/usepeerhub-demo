import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateCableHandler from "../../../handlers/billers/cable/validate-cable.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("cableTvType")
      .isIn(["dstv", "gotv", "startimes", "ShowMax"])
      .withMessage("cableTvType must be one of dstv, gotv, startimes, ShowMax"),
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("code").notEmpty().withMessage("Package code is required"),
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
 * @description Resolve the smart card / IUC number and check the account
 * is active and the wallet has enough balance, without charging or
 * subscribing.
 * @route POST /api/billers/nomba/cable/validate
 * @access Private
 * @method POST
 */
router.post(
  "/cable/validate",
  protect,
  validateRequest(),
  validateCableHandler,
);

export default router;
