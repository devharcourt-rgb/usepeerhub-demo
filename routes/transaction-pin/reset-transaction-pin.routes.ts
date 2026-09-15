import { NextFunction, Request, Response, Router } from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import resetTransactionPinHandler from "../../handlers/transaction-pin/reset-transaction-pin.handler";

const router = Router();

const validateRequest = () => {
  return [
    body("otp").notEmpty().withMessage("OTP is required"),
    body("pin")
      .isLength({ max: 4, min: 4 })
      .isNumeric()
      .withMessage("Pin must be 4 digits")
      .notEmpty()
      .withMessage("Pin is required"),
    body("confirmPin")
      .notEmpty()
      .withMessage("Confirm pin is required"),
    body("confirmPin").custom((value, { req }) => {
      if (value !== req.body.pin) {
        throw new Error("Pin confirmation does not match pin");
      }
      return true;
    }),

    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Endpoint to reset transaction pin using an OTP
 * @route /v1/transaction-pin/reset
 * @access Private
 * @method POST
 */
router.post("/reset", protect, validateRequest(), resetTransactionPinHandler);

export default router;
