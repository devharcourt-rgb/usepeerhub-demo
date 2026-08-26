import { NextFunction, Request, Router, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import createTeamHandler from "../../../handlers/admin/team/create-team.handler";
const router = Router();

const validateRequest = () => {
  return [
    body("name").notEmpty().withMessage("Name is required"),
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
 * @description Endpoint to create a team
 * @access Private
 * @method POST
 * @route `/v1/admin/team
 */
router.post("/", protect, validateRequest(), createTeamHandler);

export default router;
