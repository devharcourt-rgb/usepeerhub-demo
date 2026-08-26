import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import loginHandler from "../../handlers/auth/login.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("emailAddress").notEmpty().withMessage("Email Address is required"),
    body("password").notEmpty().withMessage("Password is required"),

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
 * @description Endpoint to login
 * @route /v1/auth/login
 * @access Public
 * @method POST
 * @param {String} emailAddress
 * @param {String} password
 */
router.post("/login", validateRequest(), loginHandler);

export default router;
