import express from "express";
import adminProtect from "../../middlewares/admin";
import pingDeviceHandler from "../../handlers/push-notification/ping.handler";

const router = express.Router();

router.post("/ping", adminProtect, pingDeviceHandler);

export default router;
