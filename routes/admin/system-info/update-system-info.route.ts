import { Router } from "express";
import protect from "../../../middlewares/auth";
import updateSystemInfoHandler from "../../../handlers/admin/system-info/update-system-info.handler";

const router = Router();

/**
 * @description Endpoint to update system info
 * @access Private
 * @method PATCH
 * @route /api/v1/admin/system-info
 */
router.patch("/", protect, updateSystemInfoHandler);

export default router;
