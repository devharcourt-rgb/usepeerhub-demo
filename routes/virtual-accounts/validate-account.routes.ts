import express from "express";
import protect from "../../middlewares/auth";

import validateAccountHandler from "../../handlers/virtual-account/cashonrails/validate-account";
import { body, validationResult } from "express-validator";

const router = express.Router();

const validateRequest = () => {
  return [
    body("bankCode").notEmpty().withMessage("Bank code is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
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
 * @description Validate account name for a given account number and bank code
 * @route POST /api/virtual-accounts/validate
 * @access Private
 * @method POST
 */
router.post("/validate", protect, validateRequest(), validateAccountHandler);

export default router;
