import express from "express";
import protect from "../../../middlewares/auth";
import { param, validationResult } from "express-validator";
import getDataPlansHandler from "../../../handlers/billers/data/get-data-plans.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    param("telco")
      .isIn(["mtn", "glo", "airtel", "9mobile"])
      .withMessage("Telco must be one of mtn, glo, airtel, 9mobile"),
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
 * @description List Nomba's data plans for a telco — cache on the client,
 * these rarely change.
 * @route GET /api/billers/nomba/data/plans/:telco
 * @access Private
 * @method GET
 */
router.get(
  "/data/plans/:telco",
  protect,
  validateRequest(),
  getDataPlansHandler,
);

export default router;
