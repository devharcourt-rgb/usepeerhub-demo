import express, { NextFunction, Request, Response } from "express";
import protect from "../../../middlewares/auth";
import validateDiscoCustomerHandler from "../../../handlers/billers/nellobytes/validate-customer.handler";
import { body, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    body("electricCompany")
      .notEmpty()
      .withMessage("Electric company is required"),
    body("meterNo").notEmpty().withMessage("Meter no is required"),
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
  validateDiscoCustomerHandler
);

export default router;
