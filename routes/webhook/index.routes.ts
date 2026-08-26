import express from "express";
const router = express.Router();

import defaultWebhookRoutes from "./webhook.routes";

router.use(defaultWebhookRoutes);

export default router;
