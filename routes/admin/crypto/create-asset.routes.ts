import express from "express";
import adminProtect from "../../../middlewares/admin";
import { body, validationResult } from "express-validator";
import createCryptoAssetHandler from "../../../handlers/admin/crypto/create-asset.handler";
import { CryptoNetwork, CryptoStandard } from "../../../types/crypto.types";

const router = express.Router();

const validateRequest = () => {
  return [
    body("symbol").notEmpty().withMessage("symbol is required"),
    body("network")
      .isIn(Object.values(CryptoNetwork))
      .withMessage(`network must be one of ${Object.values(CryptoNetwork).join(", ")}`),
    body("standard")
      .isIn(Object.values(CryptoStandard))
      .withMessage(`standard must be one of ${Object.values(CryptoStandard).join(", ")}`),
    body("displayName").notEmpty().withMessage("displayName is required"),
    body("address").notEmpty().withMessage("address is required"),
    body("decimals").isInt({ min: 0 }).withMessage("decimals is required"),
    body("requiredConfirmations")
      .isInt({ min: 0 })
      .withMessage("requiredConfirmations is required"),
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
 * @description Register a new crypto asset. Created inactive — set the
 * real address and a rate, then PATCH it active.
 * @route POST /api/admin/crypto/assets
 * @access Private (admin)
 * @method POST
 */
router.post("/", adminProtect, validateRequest(), createCryptoAssetHandler);

export default router;
