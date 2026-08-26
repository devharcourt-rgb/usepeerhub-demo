import express, { NextFunction, Request, Response } from "express";
import { validationResult, body } from "express-validator";
import protect from "../../middlewares/auth";
import changePasscodeHandler from "../../handlers/passcode/change-passcode.handler";
const router = express.Router();

const validateRequest = () => {
  return [
    body("oldPasscode")
      .isLength({ max: 6, min: 6 })
      .notEmpty()
      .withMessage("Old Passcode is required"),
    body("newPasscode")
      .isLength({ max: 6, min: 6 })
      .notEmpty()
      .withMessage("New Passcode is required"),
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
 * @description Endpoint to change passcode
 * @route /v1/passcode/change
 * @access Private
 * @method POST
 * @param {String} passcode
 */
router.post("/change", validateRequest(), protect, changePasscodeHandler);

export default router;
