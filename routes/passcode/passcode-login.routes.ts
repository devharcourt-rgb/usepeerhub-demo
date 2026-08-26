import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import loginWithPasscodeHandler from "../../handlers/passcode/passcode-login.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("passcode")
      .isLength({ max: 6, min: 6 })
      .notEmpty()
      .withMessage("Passcode is required"),
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
 * @description Endpoint to login using email and passcode
 * @route /v1/passcode/login
 * @access Private
 * @method POST
 * @param {String} passcode
 */
router.post("/login", validateRequest(), loginWithPasscodeHandler);

export default router;
