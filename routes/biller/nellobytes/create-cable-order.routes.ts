import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import buyCableHandler from "../../../handlers/billers/nellobytes/create-cable-order";

const router = express.Router();

const validateRequest = () => {
  return [
    body("cableTv").notEmpty().withMessage("Cable tv is required"),
    body("packageId").notEmpty().withMessage("Package id no is required"),
    body("smartCardNo").notEmpty().withMessage("Smart card no is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        next(errors.array());
      }

      next();
    },
  ];
};

router.post("/cable/create-order", protect, validateRequest(), buyCableHandler);

export default router;
