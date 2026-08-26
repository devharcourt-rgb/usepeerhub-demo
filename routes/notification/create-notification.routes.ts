import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import createNotificationHandler from "../../handlers/notification/create-notification.handler";
import adminProtect from "../../middlewares/admin";
const router = express.Router();

const validateRequest = () => {
  return [
    body("subject").notEmpty().withMessage("Subject is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("recipient").notEmpty().withMessage("Recipient is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      return next();
    },
  ];
};

/**
 * @description Endpoint to create a notification (admin only)
 * @route /v1/notification
 * @access Private (Admin only)
 * @method POST
 */
router.post("/", validateRequest(), adminProtect, createNotificationHandler);

export default router;
