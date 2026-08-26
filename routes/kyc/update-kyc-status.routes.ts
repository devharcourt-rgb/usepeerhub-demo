import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import updateKycStatusHandler from "../../handlers/kyc/update-kyc-status.handler";
import adminProtect from "../../middlewares/admin";
const router = express.Router();

const validateRequest = () => {
  return [
    body("status").notEmpty().withMessage("Status is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Endpoint to update kyc status
 * @route /v1/kyc/:id
 * @access Admin
 * @method PATCH
 */
router.patch("/:id", validateRequest(), adminProtect, updateKycStatusHandler);

export default router;
