import express from "express";
import webhookHandler from "../../handlers/webhook/index.handler";
import webhookHandler_ from "../../handlers/webhook/cashonrails/index.handler";
const router = express.Router();

router.post("/", webhookHandler);
router.post("/cashonrails", webhookHandler_);

export default router;
