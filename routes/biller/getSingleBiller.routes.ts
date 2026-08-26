import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import getSingleBillerHandler from "../../handlers/billers/getSingleBiller.handler";
import { param, query, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    param("id").notEmpty().withMessage("id is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        next(errors.array());
      }

      next();
    },
  ];
};

router.get("/:id", protect, validateRequest(), getSingleBillerHandler);

export default router;
