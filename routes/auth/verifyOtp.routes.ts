import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import validateOtpHandler from "../../handlers/auth/validate-otp.handler";
const router = express.Router();

const validateRequest = () => {
  return [
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
 * @description Endpoint to validate otp
 * @route /v1/auth/verify-otp
 * @access Public
 * @method POST
 * @param {String} emailAddress
 * @param {String} otp
 */
router.post("/verify-otp", validateRequest(), validateOtpHandler);

export default router;
