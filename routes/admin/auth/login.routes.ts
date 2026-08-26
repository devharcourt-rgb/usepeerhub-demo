import express, { NextFunction, Request, Response } from "express";
import adminLoginHandler from "../../../handlers/admin/auth/login.handler";
import { body, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";
const router = express.Router();

const validateRequest = () => [
  body("emailAddress").notEmpty().withMessage("email address is required"),
  body("password").notEmpty().withMessage("password is required"),

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

router.post("/login", validateRequest(), adminLoginHandler);

export default router;
