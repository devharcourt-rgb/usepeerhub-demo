import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import { param, validationResult } from "express-validator";
import getBillerProductsHandler from "../../handlers/billers/getBillerProducts.handler";

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
  "/:id/products",
  protect,
  validateRequest(),
  getBillerProductsHandler
);

export default router;
