import { Router } from "express";
import protect from "../../../middlewares/auth";
import getsystemInfoHandler from "../../../handlers/admin/system-info/get-system-info";

const router = Router();

/**
 * @description Endpoint to get system info
 * @access Private
 * @method PATCH
 * @route /api/v1/admin/system-info
 */
router.get("/", protect, getsystemInfoHandler);

export default router;
