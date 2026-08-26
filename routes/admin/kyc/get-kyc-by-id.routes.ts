import { Router } from "express";
import protect from "../../../middlewares/auth";
import getKycByIdHandler from "../../../handlers/admin/kyc/get-kyc-by-id.handler";

const router = Router();

/**
 * @description Endpoint to get kyc by id
 * @access Private
 * @method GET
 * @route /v1/admin/kyc
 */
router.get("/:id", protect, getKycByIdHandler);

export default router;
