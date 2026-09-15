import express, { NextFunction, Request, Response } from "express";
import adminProtect from "../../../middlewares/admin";
import { body, validationResult } from "express-validator";
import setCurrencyRateHandler from "../../../handlers/admin/currency/set-rate.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("rateToNGN")
      .isFloat({ gt: 0 })
      .withMessage("rateToNGN must be greater than 0"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Set a fiat currency's rate to NGN (e.g. USD) — used to show
 * balances in that currency. USD defaults to 1400 until an admin sets a
 * real rate here.
 * @route POST /api/admin/currency/:code/rate
 * @access Private (admin)
 * @method POST
 */
router.post(
  "/:code/rate",
  adminProtect,
  validateRequest(),
  setCurrencyRateHandler,
);

export default router;
