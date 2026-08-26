import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import getTransactionAnalyticsHandlerForAdmin from "../../../handlers/admin/transactions/get-transaction-analytics.handler";
import { query, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";

const router = Router();

const validateRequest = () => [
  query("user").notEmpty().withMessage("User id is required"),
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
 * @description  Endpoint for an admin to get a user's transaction analytics
 * @access Private
 * @route /v1/admin/transactions/analytics?user=:id
 * @method GET
 */
router.get(
  "/analytics",
  protect,
  validateRequest(),
  getTransactionAnalyticsHandlerForAdmin
);

export default router;
