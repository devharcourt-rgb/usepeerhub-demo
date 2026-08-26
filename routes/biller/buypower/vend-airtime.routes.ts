import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendAirtimeHandler from "../../../handlers/billers/buypower/vend-airtime";

const router = express.Router();

const validateRequest = () => {
  return [
    body("phone").notEmpty().withMessage("Phone is required"),
    body("provider").notEmpty().withMessage("Provider is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

router.post(
  "/vend-airtime",
  protect,
  validateRequest(),
  vendAirtimeHandler
);

export default router;
