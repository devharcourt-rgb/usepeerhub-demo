import express from "express";
import adminProtect from "../../../middlewares/admin";
import updateCryptoAssetHandler from "../../../handlers/admin/crypto/update-asset.handler";

const router = express.Router();

/**
 * @description Update a crypto asset's address, decimals, min deposit,
 * required confirmations, or active flag.
 * @route PATCH /api/admin/crypto/assets/:id
 * @access Private (admin)
 * @method PATCH
 */
router.patch("/:id", adminProtect, updateCryptoAssetHandler);

export default router;
