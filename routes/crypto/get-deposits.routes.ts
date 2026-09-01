import express from "express";
import protect from "../../middlewares/auth";
import getCryptoDepositsHandler from "../../handlers/crypto/get-deposits.handler";
import getCryptoDepositHandler from "../../handlers/crypto/get-deposit.handler";
import checkCryptoDepositHandler from "../../handlers/crypto/check-deposit.handler";

const router = express.Router();

/**
 * @description List the authenticated user's crypto deposit claims.
 * @route GET /api/crypto/deposits
 * @access Private
 * @method GET
 */
router.get("/deposits", protect, getCryptoDepositsHandler);

/**
 * @description Get a single deposit claim's status.
 * @route GET /api/crypto/deposits/:id
 * @access Private
 * @method GET
 */
router.get("/deposits/:id", protect, getCryptoDepositHandler);

/**
 * @description Force an immediate on-chain re-check instead of waiting for
 * the background job's next pass.
 * @route POST /api/crypto/deposits/:id/check
 * @access Private
 * @method POST
 */
router.post("/deposits/:id/check", protect, checkCryptoDepositHandler);

export default router;
