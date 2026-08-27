import express from "express";
const router = express.Router();

import loginRoute from "./login.routes";
import registerRoute from "./register.routes";
import validateOtpRoute from "./verifyOtp.routes";
import resendOtpRoute from "./resendOtp.routes";
import forgotPasswordRoute from "./forgot-password.routes";
import resetPasswordRoute from "./reset-password.routes";
import logoutRoute from "./logout.routes";
import changePasswordRoute from "./change-password.routes";

router.use(loginRoute);
router.use(registerRoute);
router.use(validateOtpRoute);
router.use(resendOtpRoute);
router.use(forgotPasswordRoute);
router.use(resetPasswordRoute);
router.use(logoutRoute);
router.use(changePasswordRoute);

export default router;
