import express from "express";
const router = express.Router();

import adminLoginRoute from "./login.routes";
import adminInviteRoute from "./send-invite.routes";
import adminAcceptInviteRoute from "./accept-invite.routes";
import adminVerifyOtpRoute from "./verify-admin-otp.routes";

router.use(adminLoginRoute);
router.use(adminInviteRoute);
router.use(adminAcceptInviteRoute);
router.use(adminVerifyOtpRoute);

export default router;
