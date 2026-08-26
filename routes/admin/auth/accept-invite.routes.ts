import express, { NextFunction, Request, Response } from "express";
const router = express.Router();

import acceptInviteHandler from "../../../handlers/admin/auth/accept-invite.handler";
import { body, query, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";

const validateRequest = () => [
  body("firstName").notEmpty().withMessage("first name is required"),
  body("lastName").notEmpty().withMessage("last name is required"),
  body("password").notEmpty().withMessage("password is required"),
  query("user").notEmpty().withMessage("user is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: "Validation error",
        errors: errors.array(),
      });
    }
    next();
  },
];

router.post("/invite/accept", validateRequest(), acceptInviteHandler);

export default router;
