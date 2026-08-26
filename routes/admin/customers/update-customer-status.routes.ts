import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import updateCustomerStatusHandler from "../../../handlers/admin/customers/update-customer-status.handler";
import { body, validationResult } from "express-validator";
import { AccountStatus } from "../../../types/user.types";

const router = Router();

const validateRequest = () => {
  return [
    body("status")
      .isIn(Object.values(AccountStatus))
      .withMessage("Invalid status"),
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
 * @description Endpoint to update a customer's status
 * @method PATCH
 * @route /api/admin/customer/:id/status
 * @access Private
 */
router.patch(
  "/:id/status",
  validateRequest(),
  protect,
  updateCustomerStatusHandler
);

export default router;
