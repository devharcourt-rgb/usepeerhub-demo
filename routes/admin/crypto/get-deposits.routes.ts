import express from "express";
import adminProtect from "../../../middlewares/admin";
import getAdminCryptoDepositsHandler from "../../../handlers/admin/crypto/get-deposits.handler";

const router = express.Router();

/**
 * @description The "who sent what" audit view — every deposit claim across
 * every user, filterable by ?status=&userId=&cryptoAssetId=.
 * @route GET /api/admin/crypto/deposits
 * @access Private (admin)
 * @method GET
 */
router.get("/deposits", adminProtect, getAdminCryptoDepositsHandler);

export default router;
