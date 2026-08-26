import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import updateKycStatusHandlerForAdmin from "../../../handlers/admin/kyc/update-kyc-status.handler";
import { body, param, validationResult } from "express-validator";
import { HTTPStatus } from "../../../utils/http.utils";

const router = Router();

const validateRequest = () => [
  param("id").notEmpty().withMessage("id is required"),
  body("status").notEmpty().withMessage("status is required"),
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
 * @description Endpoint to update kyc status
 * @access Private
 * @method POST
 * @route /v1/admin/kyc/:id/status
 */
router.post(
  "/:id/status",
  protect,
  validateRequest(),
  updateKycStatusHandlerForAdmin
);

export default router;
