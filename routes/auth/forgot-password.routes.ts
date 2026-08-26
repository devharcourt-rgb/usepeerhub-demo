import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import forgotPasswordHandler from "../../handlers/auth/forgot-password.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("emailAddress").notEmpty().withMessage("Email Address is required"),

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
 * @description Endpoint for forgot password
 * @route /v1/auth/forgot-password
 * @access Public
 * @method POST
 * @param {String} emailAddress
 */
router.post("/forgot-password", validateRequest(), forgotPasswordHandler);

export default router;
