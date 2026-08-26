import { Router } from "express";
import protect from "../../middlewares/auth";
import forgotPasscodeHandler from "../../handlers/passcode/forgot-passcode.handler";

const router = Router();
/**
 * @description Endpoint to forgot passcode
 * @route /v1/passcode/forgot
 * @access Private
 * @method POST
 */
router.post("/forgot", protect, forgotPasscodeHandler);

export default router;
