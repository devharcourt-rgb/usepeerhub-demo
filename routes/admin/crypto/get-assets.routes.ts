import express from "express";
import adminProtect from "../../../middlewares/admin";
import getAdminCryptoAssetsHandler from "../../../handlers/admin/crypto/get-assets.handler";

const router = express.Router();

/**
 * @description List every crypto asset, including inactive ones.
 * @route GET /api/admin/crypto/assets
 * @access Private (admin)
 * @method GET
 */
router.get("/", adminProtect, getAdminCryptoAssetsHandler);

export default router;
