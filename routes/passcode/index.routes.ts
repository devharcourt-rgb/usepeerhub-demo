import { Router } from "express";
import setupPasscodeRoutes from "./setup-passcode.routes";
import verifyPasscodeRoutes from "./verify-passcode.routes";
import loginWithPasscodeRoutes from "./passcode-login.routes";
import changePasscodeRoute from "./change-passcode.routes";
// import forgotPasscodeRoute from "./forgot-passcode.routes";
// import resetPasscodeRoute from "./reset-passcode.routes";

const router = Router();

router.use(setupPasscodeRoutes);
router.use(verifyPasscodeRoutes);
router.use(loginWithPasscodeRoutes);
router.use(changePasscodeRoute);
// router.use(forgotPasscodeRoute);
// router.use(resetPasscodeRoute);

export default router;
