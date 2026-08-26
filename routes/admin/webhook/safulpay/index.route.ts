import express from "express";
import configureWebhookRoute from "./configure-webhook.route";

const router = express.Router();

router.use(configureWebhookRoute);

export default router;
