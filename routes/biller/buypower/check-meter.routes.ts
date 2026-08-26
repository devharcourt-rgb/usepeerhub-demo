import express from "express";
import protect from "../../../middlewares/auth";
import checkMeterHandler from "../../../handlers/billers/buypower/check-meter";
import { body, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    body("meter").notEmpty().withMessage("Meter is required"),
    body("disco").notEmpty().withMessage("Disco is required"),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

router.post("/check-meter", protect, validateRequest(), checkMeterHandler);

export default router;
