import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendCableHandler from "../../../handlers/billers/cable/vend-cable.handler";

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
 * @description Subscribe to a cable TV package via Nomba. Creates a
 * PENDING transaction — it's confirmed COMPLETED/FAILED asynchronously via
 * the Nomba webhook.
 * @route POST /api/billers/nomba/cable/vend
 * @access Private
 * @method POST
 */
router.post("/cable/vend", protect, validateRequest(), vendCableHandler);

export default router;
