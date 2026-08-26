import { NextFunction, Request, Response, Router } from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import resetPasscodeHandler from "../../handlers/passcode/reset-passcode.handler";

const router = Router();

const validateRequest = () => {
  return [
    body("otp").notEmpty().withMessage("OTP is required"),
    body("passcode").notEmpty().withMessage("Passcode is required"),
    body("confirmPasscode")
      .notEmpty()
      .withMessage("Confirm passcode is required"),
    body("confirmPasscode").custom((value, { req }) => {
      if (value !== req.body.passcode) {
        throw new Error("Passcode confirmation does not match passcode");
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
 * @description Endpoint to resset passcode
 * @route /v1/passcode/reset
 * @access Private
 * @method POST
 */
router.post("/reset", protect, validateRequest(), resetPasscodeHandler);

export default router;
