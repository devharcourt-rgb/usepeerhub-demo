import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import createBillOrderHandler from "../../handlers/billers/createBillOrder.handler";
import operationMiddleware from "../../middlewares/operation";

const router = express.Router();

const validateRequest = () => {
  return [
    body("customerId").notEmpty().withMessage("customer id is required"),
    body("amountEntered").notEmpty().withMessage("amount entered is required"),
    body("itemCode").notEmpty().withMessage("item code is required"),
    body("billerCode").notEmpty().withMessage("biller code is required"),
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
  "/orders/create",
  protect,
  operationMiddleware,
  validateRequest(),
  createBillOrderHandler
);

export default router;
