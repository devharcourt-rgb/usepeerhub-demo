import { Router } from "express";
import protect from "../../../middlewares/auth";

import getCardAnalyticsForAdminHandler from "../../../handlers/admin/cards/get-card-anylytics.handler";

const router = Router();

router.get("/:id/analytics", protect, getCardAnalyticsForAdminHandler);

export default router;
