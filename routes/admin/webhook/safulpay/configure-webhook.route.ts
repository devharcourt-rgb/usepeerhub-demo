import { NextFunction, Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import configureSafulPayWebhook from "../../../../handlers/admin/webhook/safulpay/configure-webhook.handler";
import { HTTPStatus } from "../../../../utils/http.utils";
import protect from "../../../../middlewares/auth";

const router = Router();

const validateRequest = () => [
  body("url").notEmpty().withMessage("URL is required"),
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

router.post("/configure", protect, validateRequest(), configureSafulPayWebhook);

export default router;
