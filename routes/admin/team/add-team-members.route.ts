import { NextFunction, Request, Router, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import addTeamMembersHandler from "../../../handlers/admin/team/add-team-members.handler";
const router = Router();

const validateRequest = () => {
  return [
    body("team").notEmpty().withMessage("Team is required"),
    body("members")
      .isArray({ min: 1 })
      .notEmpty()
      .withMessage("Members is required"),
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
 * @description Endpoint to add members to a team
 * @access Private
 * @method POST
 * @route `/v1/admin/team/members
 */
router.post("/members", protect, validateRequest(), addTeamMembersHandler);

export default router;
