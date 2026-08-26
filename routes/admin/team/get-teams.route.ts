import { Router } from "express";
import protect from "../../../middlewares/auth";
import getTeamsHandler from "../../../handlers/admin/team/get-teams.handler";
import operationMiddleware from "../../../middlewares/operation";
const router = Router();

/**
 * @description Endpoint to get teams
 * @access Private
 * @method POST
 * @route `/v1/admin/team
 */
router.get("/", protect, operationMiddleware, getTeamsHandler);

export default router;
