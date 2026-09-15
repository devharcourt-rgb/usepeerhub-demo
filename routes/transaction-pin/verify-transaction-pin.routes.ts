import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import verifyTransactionPinHandler from "../../handlers/transaction-pin/verify-transaction-pin.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("pin")
      .isLength({ max: 4, min: 4 })
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
 * @description Endpoint to verify transaction pin
 * @route /v1/transaction-pin/verify
 * @access Private
 * @method POST
 * @param {String} pin
 */
router.post("/verify", validateRequest(), protect, verifyTransactionPinHandler);

export default router;
