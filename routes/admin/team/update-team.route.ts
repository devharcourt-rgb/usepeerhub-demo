import { NextFunction, Request, Router, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, param, validationResult } from "express-validator";
import updateTeamHandler from "../../../handlers/admin/team/update-team.handler";
const router = Router();

const validateRequest = () => {
  return [
    param("id").notEmpty().withMessage("Id is required"),
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
 * @description Endpoint to update a team
 * @access Private
 * @method PATCH
 * @route `/v1/admin/team
 */
router.patch("/:id", protect, validateRequest(), updateTeamHandler);

export default router;
