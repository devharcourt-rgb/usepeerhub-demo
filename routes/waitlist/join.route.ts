import express, { NextFunction, Request, Response } from "express";
import joinWaitlistHandler from "../../handlers/waitlist/join.handler";
import { body, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    body("emailAddress").isEmail().withMessage("Valid email is required"),
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
 * @description Endpoint to join the waitlist
 * @route /v1/waitlist/join
 * @access Public
 * @method POST
 * @param {String} emailAddress
 */
router.post("/join", validateRequest(), joinWaitlistHandler);

export default router;
