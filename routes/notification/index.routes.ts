import express, { Router } from "express";
import createNotificationRoutes from "./create-notification.routes";
import getNotificationsRoutes from "./get-notifications.routes";
import getSingleNotificationRoutes from "./get-single-notification.routes";
import updateNotificationRoutes from "./update-notification.routes";

const router = Router();

router.use(createNotificationRoutes);
router.use(getNotificationsRoutes);
router.use(getSingleNotificationRoutes);
router.use(updateNotificationRoutes);

export default router;
