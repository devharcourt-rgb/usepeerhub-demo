import express, { NextFunction, Request, Response } from "express";
const router = express.Router();

import verifyAdminOtpHandler from "../../../handlers/admin/auth/verify-admin-otp.handler";
import { body, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";

const validateRequest = () => [
  body("emailAddress").notEmpty().withMessage("email address is required"),
  body("otp").notEmpty().withMessage("otp is required"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: "Validation error",
        errors: errors.array(),
      });
    }
    next();
  },
];

/**
 * @description Endpoint to verify admin OTP
 * @access Public
 * @route POST /api/v1/admin/auth/verify-otp
 */
router.post("/verify-otp", validateRequest(), verifyAdminOtpHandler);

export default router;
