import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendDataHandler from "../../../handlers/billers/data/vend-data.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("telco")
      .isIn(["mtn", "glo", "airtel", "9mobile"])
      .withMessage("Telco must be one of mtn, glo, airtel, 9mobile"),
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number is required")
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
 * @description Purchase a data bundle via Nomba. Creates a PENDING
 * transaction — it's confirmed COMPLETED/FAILED asynchronously via the
 * Nomba webhook.
 * @route POST /api/billers/nomba/data/vend
 * @access Private
 * @method POST
 */
router.post("/data/vend", protect, validateRequest(), vendDataHandler);

export default router;
