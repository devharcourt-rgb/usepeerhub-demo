import express from "express";
import protect from "../../middlewares/auth";
import getCryptoAssetsHandler from "../../handlers/crypto/get-assets.handler";

const router = express.Router();

/**
 * @description List active crypto assets — the shared deposit address and
 * current rate for each.
 * @route GET /v1/crypto/assets
 * @access Private
 * @method GET
 */
router.get("/assets", protect, getCryptoAssetsHandler);

export default router;
