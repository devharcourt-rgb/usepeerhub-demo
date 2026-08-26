import express from "express";
import protect from "../../middlewares/auth";
import getUserKycHandler from "../../handlers/kyc/get-user.kyc.handler";
const router = express.Router();

/**
 * @description Endpoint to complete kyc
 * @route /v1/kyc
 * @access Private
 * @method GET
 */
router.get("/", protect, getUserKycHandler);

export default router;
