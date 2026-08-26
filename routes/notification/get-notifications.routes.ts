import express from "express";
import protect from "../../middlewares/auth";
import getNotificationsHandler from "../../handlers/notification/get-notifications.handler";
const router = express.Router();

/**
 * @description Endpoint to get all user notifications
 * @route /v1/notification
 * @access Private
 * @method GET
 */
router.get("/", protect, getNotificationsHandler);

export default router;
