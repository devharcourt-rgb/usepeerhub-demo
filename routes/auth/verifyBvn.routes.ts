import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import validateOtpHandler from "../../handlers/auth/validate-otp.handler";
import verifyBvnHandler from "../../handlers/auth/verify-bvn.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("emailAddress").notEmpty().withMessage("Email address is required"),
    body("bvn").notEmpty().withMessage("BVN is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required"),

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
 * @description Endpoint to verify bvn
 * @route /v1/auth/bvn/verify
 * @access Public
 * @method POST
 * @param {String} emailAddress
 * @param {String} bvn
 * @param {String} dateOfBirth
 */
router.post("/bvn/verify", validateRequest(), verifyBvnHandler);

export default router;
