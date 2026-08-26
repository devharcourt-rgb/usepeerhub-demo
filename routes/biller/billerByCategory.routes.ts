import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import { param, validationResult } from "express-validator";
import getBillerByCategoryHandler from "../../handlers/billers/billersByCategory.handler";

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

router.get(
  "/category/:id",
  protect,
  validateRequest(),
  getBillerByCategoryHandler
);

export default router;
