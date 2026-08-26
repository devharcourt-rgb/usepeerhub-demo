import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import registerHandler from "../../handlers/auth/register.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("firstName").notEmpty().withMessage("First Name is required"),
    body("lastName").notEmpty().withMessage("Last Name is required"),
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
 * @description Endpoint to create an account
 * @route /v1/auth/register
 * @access Public
 * @method POST
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} emailAddress
 * @param {String} password
 */
router.post("/register", validateRequest(), registerHandler);

export default router;
