import express from "express";
import webhookHandler from "../../handlers/webhook/index.handler";
import nombaWebhookHandler from "../../handlers/webhook/nomba/index.handler";
const router = express.Router();

router.post("/", webhookHandler);
router.post("/nomba", nombaWebhookHandler);

export default router;
