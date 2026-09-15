import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import setupTransactionPinHandler from "../../handlers/transaction-pin/setup-transaction-pin.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("pin")
      .isLength({ max: 4, min: 4 })
      .withMessage("Pin must be 4 digits")
      .isNumeric()
      .withMessage("Pin must contain only digits")
      .notEmpty()
      .withMessage("Pin is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      return next();
    },
  ];
};

/**
 * @description Endpoint to setup transaction pin
 * @route /v1/transaction-pin
 * @access Private
 * @method POST
 * @param {String} pin
 */
router.post("/", validateRequest(), protect, setupTransactionPinHandler);

export default router;
