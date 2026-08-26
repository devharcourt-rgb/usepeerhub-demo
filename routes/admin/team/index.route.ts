import { Router } from "express";

import createTeamRoutes from "./create-team.route";
import updateTeamRoutes from "./update-team.route";
import addTeamMembersRoutes from "./add-team-members.route";
import changeTeamMemberRoleRoutes from "./change-team-member-role.route";
import getTeamsRoutes from "./get-teams.route";

const router = Router();

router.use(createTeamRoutes);
router.use(updateTeamRoutes);
router.use(addTeamMembersRoutes);
router.use(changeTeamMemberRoleRoutes);
router.use(getTeamsRoutes);

export default router;
