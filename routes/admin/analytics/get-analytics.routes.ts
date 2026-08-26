import { Router } from "express";
import getAnalyticsHandlerForAdmin from "../../../handlers/admin/analytics/get-analytics.handler";
import protect from "../../../middlewares/auth";

const router = Router();

/**
 * @description Endpoint to get analytics for admin
 * @access Private
 * @route /v1/admin/analytics
 * @method GET
 */
router.get("/", protect, getAnalyticsHandlerForAdmin);

export default router;
