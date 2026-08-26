import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import resendOtpHandler from "../../handlers/auth/resend-otp.handler";
import { requestLimiter } from "../../middlewares/rate-limiter";

const router = express.Router();

const validateRequest = () => {
  return [
    body("emailAddress").notEmpty().withMessage("Email address is required"),

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
 * @description Endpoint to resend otp
 * @route /v1/auth/resend-otp
 * @access Public
 * @method POST
 * @param {String} emailAddress
 */
router.post("/resend-otp", validateRequest(), requestLimiter, resendOtpHandler);

export default router;
