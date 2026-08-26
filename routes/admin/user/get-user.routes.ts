import express, { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import getUserHandlerForAdmin from "../../../handlers/admin/user/get-user.handler";

const router = express.Router();

const validateRequest = () => {
  return [
    param("id").isString().withMessage("id must be a string"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

/**
 * @description Endpoint to get an admin user by id
 * @method GET
 * @access Private
 * @route /v1/admin/users/:id
 */
router.get("/:id", validateRequest(), getUserHandlerForAdmin);

export default router;
