import { NextFunction, Request, Response, Router } from "express";
import { param, validationResult } from "express-validator";
import generateTransactionReceiptHandlerForAdmin from "../../../handlers/admin/transactions/generate-receipt.handler";
import protect from "../../../middlewares/auth";

const router = Router();

const validateRequest = () => {
  return [
    param("id").isMongoId().notEmpty().withMessage("id is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      next();
    },
  ];
};

router.post(
  ":id/generate-receipt",
  validateRequest(),
  protect,
  generateTransactionReceiptHandlerForAdmin
);

export default router;
