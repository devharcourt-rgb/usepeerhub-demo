import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import verifyPasscodeHandler from "../../handlers/passcode/verify-passcode.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("passcode")
      .isLength({ max: 6, min: 6 })
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
 * @description Endpoint to verify passcode
 * @route /v1/passcode/verify
 * @access Private
 * @method POST
 * @param {String} passcode
 */
router.post("/verify", validateRequest(), protect, verifyPasscodeHandler);

export default router;
