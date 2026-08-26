import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import shadowUserHandler from "../../../handlers/admin/shadow/connect.handler";
import { body, validationResult } from "express-validator";
import disconnectShadowHandler from "../../../handlers/admin/shadow/disconnect.handler";

const validateRequest = () => {
  return [
    body("user").notEmpty().withMessage("User ID is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

const router = Router();

/**
 * @description Endpoint for an admin to disconnect a shadowed a user
 * @method POST
 * @route /admin/shadow/disconnect
 * @access Private
 */
router.post("/disconnect", protect, validateRequest(), disconnectShadowHandler);

export default router;
