import { Router } from "express";
import getAnalyticsRoute from "./get-analytics.routes";

const router = Router();

router.use(getAnalyticsRoute);

export default router;
