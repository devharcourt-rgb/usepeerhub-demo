import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import getTransactionHandlerForAdmin from "../../../handlers/admin/transactions/get-transaction.handler";
import { param, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";

const router = Router();

const validateRequest = () => [
  param("id").notEmpty().withMessage("Invalid transaction id"),
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
 * @description  Endpoint for an admin to get transaction by id
 * @access Private
 * @route /v1/admin/transactions/:id
 * @method GET
 */
router.get("/:id", protect, validateRequest(), getTransactionHandlerForAdmin);

export default router;
