import express from "express";
import protect from "../../middlewares/auth";
import getSingleNotificationHandler from "../../handlers/notification/get-single-notification.handler";
const router = express.Router();

/**
 * @description Endpoint to get notification by id
 * @route /v1/notification/:id
 * @access Private
 * @method GET
 */
router.get("/:id", protect, getSingleNotificationHandler);

export default router;
