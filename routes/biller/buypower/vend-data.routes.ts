import express from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import create from "../../../handlers/billers/buypower/vend-data";

const router = express.Router();

const validateRequest = () => {
  return [
    body("phone").notEmpty().withMessage("Phone is required"),
    body("provider").notEmpty().withMessage("Provider is required"),
    body("amount").notEmpty().withMessage("Amount is required"),
    body(["tariffClass", "package"])
    .custom((value, { req }) => {
      if (!req.body.tariffClass && !req.body.package) {
        throw new Error(
          "Tariff Class (Product code) or Package is required"
        );
      }
      return true;
    }),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), payload: req.body });
      }
      next();
    },
  ];
};

router.post(
  "/vend-data",
  protect,
  validateRequest(),
  create
);

export default router;
