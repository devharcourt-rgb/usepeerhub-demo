import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import validateCustomerDetailHandler from "../../handlers/billers/validateCustomerDetails.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    body("customer").notEmpty().withMessage("customer is required"),
    body("billerCode").notEmpty().withMessage("biller code is required"),
    body("itemCode").notEmpty().withMessage("item code is required"),

    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        next(errors.array());
      }

      next();
    },
  ];
};

router.post(
  "/validate",
  protect,
  validateRequest(),
  validateCustomerDetailHandler
);

export default router;
