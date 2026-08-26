import express from "express";
import { validationResult, query } from "express-validator";
import index from "../../../handlers/billers/buypower/provider-pricelist";

const router = express.Router();

const validateRequest = () => {
  return [
    query("vertical").notEmpty().withMessage("Vertical is required"),
    query("provider").notEmpty().withMessage("Provider is required"),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

router.get("/price-list", validateRequest(), index);

export default router;
