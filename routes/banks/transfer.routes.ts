import express from "express";
import protect from "../../middlewares/auth";
import { body, validationResult } from "express-validator";
import transferHandler from "../../handlers/banks/transfer";
import operationMiddleware from "../../middlewares/operation";

const router = express.Router();

const validateRequest = () => {
  return [
    body("amount").isNumeric().notEmpty().withMessage("Amount is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("accountName").notEmpty().withMessage("Account name is required"),
    body("bankCode").notEmpty().withMessage("Bank code is required"),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Initiate a bank transfer via Nomba
 * @route POST /api/banks/transfer
 * @access Private
 * @method POST
 */
router.post(
  "/transfer",
  protect,
  operationMiddleware,
  validateRequest(),
  transferHandler,
);

export default router;
