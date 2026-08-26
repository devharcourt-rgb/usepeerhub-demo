import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import { param, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";
import getVirtualAccountByIdHandler from "../../../handlers/admin/virtual-accounts/get-va-by-id.handler";

const router = Router();

const validateRequest = () => [
  param("id").notEmpty().withMessage("id is required"),
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

router.get("/:id", protect, validateRequest(), getVirtualAccountByIdHandler);

export default router;
