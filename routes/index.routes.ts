import express from "express";
const router = express.Router();

import authRoutes from "./auth/index.routes";
import kycRoutes from "./kyc/index.routes";
import passcodeRoutes from "./passcode/index.routes";
import notificationRoutes from "./notification/index.routes";
import userRoutes from "./user/index.routes";
import billerRoutes from "./biller/index.routes";
import transactionRoutes from "./transaction/index.routes";
import virtualAccountRoutes from "./virtual-accounts/index.routes";
import adminRoutes from "./admin/index.routes";
import webhookRoutes from "./webhook/index.routes";
import constantsRoute from "./constants/index.routes";
import systemInfoRoutes from "./system-info/index.routes";
import debugRoutes from "./debug/index";
import waitlistRoutes from "./waitlist/index.route";
import pushNotificationRoutes from "./push-notification/index.routes";

router.use("/auth", authRoutes);
router.use("/kyc", kycRoutes);
router.use("/passcode", passcodeRoutes);
router.use("/notification", notificationRoutes);
router.use("/user", userRoutes);
router.use("/billers", billerRoutes);
router.use("/transactions", transactionRoutes);
router.use("/virtual-account", virtualAccountRoutes);
router.use("/webhook", webhookRoutes);
router.use("/admin", adminRoutes);
router.use("/constants", constantsRoute);
router.use("/system-info", systemInfoRoutes);
router.use("/debugger", debugRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/pn", pushNotificationRoutes);

export default router;
