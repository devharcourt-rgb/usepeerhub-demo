import express from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import createCryptoDepositHandler from "../../handlers/crypto/create-deposit.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("cryptoAssetId").notEmpty().withMessage("cryptoAssetId is required"),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be greater than 0"),
    body("txHash").notEmpty().withMessage("txHash is required"),
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
 * @description Claim a crypto deposit sent to the shared establishment
 * address. Creates a PENDING deposit — the wallet is credited automatically
 * once on-chain verification confirms it.
 * @route POST /api/crypto/deposits
 * @access Private
 * @method POST
 */
router.post(
  "/deposits",
  protect,
  validateRequest(),
  createCryptoDepositHandler,
);

export default router;
