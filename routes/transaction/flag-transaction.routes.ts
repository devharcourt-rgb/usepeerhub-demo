import { NextFunction, Request, Response, Router } from "express";
import protect from "../../middlewares/auth";
import { body, param, validationResult } from "express-validator";
import { HTTPStatus } from "../../utils/http.utils";
import flagTransactionHandler from "../../handlers/transaction/flag-transaction.handler";
import adminProtect from "../../middlewares/admin";

const router = Router();

const validateRequest = () => [
  param("id").notEmpty().withMessage("ID is required"),
  body("flag").isBoolean().withMessage("Flag is a required boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: "Invalid request",
        errors: errors.array(),
      });
    }

    next();
  },
];

/**
 * @description  Endpoint to flag a transaction
 * @access Private
 * @route /v1/admin/transactions/:id/flag
 * @method POST
 */
router.post(
  "/:id/flag",
  adminProtect,
  validateRequest(),
  flagTransactionHandler,
);

export default router;
