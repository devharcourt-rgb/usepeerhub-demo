import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import vendElectricityHandler from "../../../handlers/billers/buypower/vend-electricity";

const router = express.Router();

const validateRequest = () => {
  return [
    body("meter").notEmpty().withMessage("Meter is required"),
    body("disco").notEmpty().withMessage("Disco is required"),
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
  "/vend-electricity",
  protect,
  validateRequest(),
  vendElectricityHandler
);

export default router;
