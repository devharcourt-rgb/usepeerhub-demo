import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendAirtimeHandler from "../../../handlers/billers/airtime/vend-airtime.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("amount")
      .isFloat({ min: 50 })
      .withMessage("Amount must be at least 50"),
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ min: 10, max: 14 })
      .withMessage("Phone number is invalid"),
    body("network")
      .isIn(["MTN", "GLO", "AIRTEL", "9MOBILE"])
      .withMessage("Network must be one of MTN, GLO, AIRTEL, 9MOBILE"),
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
 * @description Purchase airtime via Nomba. Creates a PENDING transaction —
 * it's confirmed COMPLETED/FAILED asynchronously via the Nomba webhook.
 * @route POST /api/billers/nomba/airtime/vend
 * @access Private
 * @method POST
 */
router.post("/airtime/vend", protect, validateRequest(), vendAirtimeHandler);

export default router;
