import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import changeTransactionPinHandler from "../../handlers/transaction-pin/change-transaction-pin.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("oldPin")
      .isLength({ max: 4, min: 4 })
      .notEmpty()
      .withMessage("Old pin is required"),
    body("newPin")
      .isLength({ max: 4, min: 4 })
      .isNumeric()
      .withMessage("New pin must be 4 digits")
      .notEmpty()
      .withMessage("New pin is required"),
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
 * @description Endpoint to change transaction pin
 * @route /v1/transaction-pin/change
 * @access Private
 * @method POST
 * @param {String} oldPin
 * @param {String} newPin
 */
router.post("/change", validateRequest(), protect, changeTransactionPinHandler);

export default router;
