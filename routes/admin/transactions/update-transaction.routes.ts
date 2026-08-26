import { NextFunction, Request, Response, Router } from "express";
import { param, validationResult } from "express-validator";
import protect from "../../../middlewares/auth";
import updateTransactionHandlerForAdmin from "../../../handlers/admin/transactions/update-transaction.handler";

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

/**
 * @description Endpoint to update a transaction
 * @method PATCH
 * @route /api/admin/transaction/:id/status
 * @access Private
 */
router.patch(
  "/:id/status",
  validateRequest(),
  protect,
  updateTransactionHandlerForAdmin
);

export default router;
