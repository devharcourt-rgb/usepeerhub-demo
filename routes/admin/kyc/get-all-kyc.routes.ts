import { Router } from "express";
import protect from "../../../middlewares/auth";
import getAllKycHandlerForAdmin from "../../../handlers/admin/kyc/get-all-kyc.handler";

const router = Router();

/**
 * @description Endpoint to get all kyc data
 * @access Private
 * @method GET
 * @route /v1/admin/kyc
 */
router.get("/", protect, getAllKycHandlerForAdmin);

export default router;
