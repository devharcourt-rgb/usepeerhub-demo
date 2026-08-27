import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendBettingHandler from "../../../handlers/billers/betting/vend-betting.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("providerId").notEmpty().withMessage("Provider ID is required"),
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("amount")
      .isFloat({ min: 50 })
      .withMessage("Amount must be at least 50"),
    body("phoneNumber")
      .optional()
      .isLength({ min: 10, max: 14 })
      .withMessage("Phone number is invalid"),
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
 * @description Fund a betting wallet via Nomba. Creates a PENDING
 * transaction — it's confirmed COMPLETED/FAILED asynchronously via the
 * Nomba webhook.
 * @route POST /api/billers/nomba/betting/vend
 * @access Private
 * @method POST
 */
router.post("/betting/vend", protect, validateRequest(), vendBettingHandler);

export default router;
