import express from "express";
import adminProtect from "../../../middlewares/admin";
import { body, validationResult } from "express-validator";
import setCryptoRateHandler from "../../../handlers/admin/crypto/set-rate.handler";
import getCryptoRateHistoryHandler from "../../../handlers/admin/crypto/get-rate-history.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("rateToNGN")
      .isFloat({ gt: 0 })
      .withMessage("rateToNGN must be greater than 0"),
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
 * @description Set an asset's crypto→NGN rate. Logged to rate history for
 * accountability.
 * @route POST /api/admin/crypto/assets/:id/rate
 * @access Private (admin)
 * @method POST
 */
router.post("/:id/rate", adminProtect, validateRequest(), setCryptoRateHandler);

/**
 * @description View an asset's rate change history — who set what, when.
 * @route GET /api/admin/crypto/assets/:id/rate-history
 * @access Private (admin)
 * @method GET
 */
router.get("/:id/rate-history", adminProtect, getCryptoRateHistoryHandler);

export default router;
