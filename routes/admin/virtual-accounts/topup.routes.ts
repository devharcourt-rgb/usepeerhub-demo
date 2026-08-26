import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import { body, param, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";
import virtualAccountTopUpHandlerForAdmin from "../../../handlers/admin/virtual-accounts/topup.handler";
import operationMiddleware from "../../../middlewares/operation";

const router = Router();

const validateRequest = () => [
  param("id").notEmpty().withMessage("id is required"),
  body("amount").notEmpty().withMessage("amount is required"),
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

router.post(
  "/:id/topup",
  protect,
  operationMiddleware,
  validateRequest(),
  virtualAccountTopUpHandlerForAdmin
);

export default router;
