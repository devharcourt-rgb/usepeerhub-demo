import express from "express";
import protect from "../../../middlewares/auth";
import { param, validationResult } from "express-validator";
import getCableProductsHandler from "../../../handlers/billers/cable/get-cable-products.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    param("cableTvType")
      .isIn(["dstv", "gotv", "startimes", "ShowMax"])
      .withMessage("cableTvType must be one of dstv, gotv, startimes, ShowMax"),
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
 * @description List Nomba's cable TV packages/prices for a provider —
 * cache on the client, these rarely change.
 * @route GET /api/billers/nomba/cable/products/:cableTvType
 * @access Private
 * @method GET
 */
router.get(
  "/cable/products/:cableTvType",
  protect,
  validateRequest(),
  getCableProductsHandler,
);

export default router;
