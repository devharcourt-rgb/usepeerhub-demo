import express, { NextFunction, Request, Response } from "express";
import protect from "../../middlewares/auth";
import getTransactionsAnalysisHandler from "../../handlers/transaction/get-transaction-analysis.handler";
import { param, validationResult } from "express-validator";
import { HTTPStatus } from "../../utils/http.utils";
const router = express.Router();

const validateRequest = () => [
  param("user").notEmpty().withMessage("ID is required"),

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
 * @description Get transactions analysis
 * @access Private
 * @method Get
 * @route /transactions/analytics
 */
router.get(
  "/analytics",
  protect,
  validateRequest(),
  getTransactionsAnalysisHandler
);

export default router;
