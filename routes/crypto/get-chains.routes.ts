import express from "express";
import protect from "../../middlewares/auth";
import getChainsHandler from "../../handlers/crypto/get-chains.handler";

const router = express.Router();

/**
 * @description List all crypto assets
 * @route GET /v1/crypto/chains
 * @access Private
 * @method GET
 */
router.get("/chains", protect, getChainsHandler);

export default router;
