import { Router } from "express";
import getSystemInfoHandler from "../../handlers/system-info/get-system-info.handler";

const router = Router();

/**
 * @description Endpoint to get system info
 * @access Public
 * @method GET
 * @route /api/v1/system-info
 */
router.get("/", getSystemInfoHandler);

export default router;
