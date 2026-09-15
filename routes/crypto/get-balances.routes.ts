import express from "express";
import protect from "../../middlewares/auth";
import getCryptoBalancesHandler from "../../handlers/crypto/get-balances.handler";

const router = express.Router();

/**
 * @description The user's balance for every active crypto asset — derived
 * from completed, on-chain-verified deposits — plus NGN/USD equivalents.
 * Every active asset is included even with no deposits (balance 0).
 * @route GET /v1/crypto/balances
 * @access Private
 * @method GET
 */
router.get("/balances", protect, getCryptoBalancesHandler);

export default router;
