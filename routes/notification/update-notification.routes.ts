import express from "express";
import protect from "../../middlewares/auth";
import updateNotificationHandler from "../../handlers/notification/update-notification.handler";
const router = express.Router();

/**
 * @description Endpoint to update a notification
 * @route /v1/notification/:id
 * @access Private
 * @method PATCH
 */
router.patch("/:id", protect, updateNotificationHandler);

export default router;
