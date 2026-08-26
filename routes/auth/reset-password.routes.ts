import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import resetPasswordHandler from "../../handlers/auth/reset-password.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("password").notEmpty().withMessage("Password is required"),
    body("emailAddress").notEmpty().withMessage("Email address is required"),
    body("otp").notEmpty().withMessage("OTP is required"),

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
 * @description Endpoint for reset password
 * @route /v1/auth/reset-password
 * @access Public
 * @method POST
 * @param {String} password
 * @param {String} emailAddress
 * @param {String} otp
 */
router.post("/reset-password", validateRequest(), resetPasswordHandler);

export default router;
