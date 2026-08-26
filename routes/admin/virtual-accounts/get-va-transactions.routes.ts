import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import { query, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";
import getVATransactionsHandlerForAdmin from "../../../handlers/admin/virtual-accounts/get-va-transactions.handler";

const router = Router();

const validateRequest = () => [
  query("id").notEmpty().withMessage("id is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HTTPStatus.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    next();
  },
];

router.get(
  "/transactions",
  protect,
  validateRequest(),
  getVATransactionsHandlerForAdmin
);

export default router;
