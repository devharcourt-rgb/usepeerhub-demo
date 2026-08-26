import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import setupPasscodeHandler from "../../handlers/passcode/setup-passcode.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("passcode")
      .isLength({ max: 6, min: 6 })
      .withMessage("Passcode must be 6 digits")
      .notEmpty()
      .withMessage("Passcode is required"),
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
 * @description Endpoint to setup passcode
 * @route /v1/passcode
 * @access Private
 * @method POST
 * @param {String} passcode
 */
router.post("/", validateRequest(), protect, setupPasscodeHandler);

export default router;
