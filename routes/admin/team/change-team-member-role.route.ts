import { NextFunction, Request, Router, Response } from "express";
import protect from "../../../middlewares/auth";
import { body, param, validationResult } from "express-validator";
import changeTeamMemberRoleHandler from "../../../handlers/admin/team/change-team-member-role.handler";
const router = Router();

const validateRequest = () => {
  return [
    param("id").notEmpty().withMessage("Id is required"),
    body("role").notEmpty().withMessage("Role is required"),
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
 * @description Endpoint to change a team member role
 * @access Private
 * @method PATCH
 * @route `/v1/admin/team/members/:id
 */
router.patch(
  "/member/:id",
  protect,
  validateRequest(),
  changeTeamMemberRoleHandler
);

export default router;
