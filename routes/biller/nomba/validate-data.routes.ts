import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateDataHandler from "../../../handlers/billers/data/validate-data.handler";

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
 * @description Check the plan exists, the account is active, and the wallet
 * has enough balance for a data purchase, without charging or contacting
 * Nomba.
 * @route POST /api/billers/nomba/data/validate
 * @access Private
 * @method POST
 */
router.post(
  "/data/validate",
  protect,
  validateRequest(),
  validateDataHandler,
);

export default router;
