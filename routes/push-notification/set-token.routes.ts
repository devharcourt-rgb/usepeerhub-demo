import express, { Request, Response, NextFunction } from "express";
import protect from "../../middlewares/auth";
import setDeviceTokenHandler from "../../handlers/push-notification/set-token.handler";
import { body, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    body("token").isString().notEmpty().withMessage("Token is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      return next();
    },
  ];
};

router.put("/set-token", protect, validateRequest(), setDeviceTokenHandler);

export default router;
