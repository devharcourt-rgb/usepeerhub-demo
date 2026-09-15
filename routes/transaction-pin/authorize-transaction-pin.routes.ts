import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import authorizeTransactionPinHandler from "../../handlers/transaction-pin/authorize-transaction-pin.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("pin")
      .isLength({ max: 4, min: 4 })
      .isNumeric()
      .withMessage("Pin must be 4 digits")
      .notEmpty()
      .withMessage("Pin is required"),
    body("action")
      .notEmpty()
      .withMessage("Action is required")
      .isString()
      .withMessage("Action must be a string"),
    body("payload")
      .optional()
      .isObject()
      .withMessage("Payload must be an object"),
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
 * @description Verifies the transaction pin and issues a short-lived, single-use
 * token scoped to a specific transaction. Downstream transaction endpoints should
 * require this token (via requireTransactionAuthorization) instead of the raw pin.
 * @route /v1/transaction-pin/authorize
 * @access Private
 * @method POST
 * @param {String} pin
 * @param {String} action - identifier of the transaction endpoint being authorized (e.g. "bank-transfer")
 * @param {Object} [payload] - the exact transaction details the token will be bound to
 */
router.post(
  "/authorize",
  validateRequest(),
  protect,
  authorizeTransactionPinHandler,
);

export default router;
