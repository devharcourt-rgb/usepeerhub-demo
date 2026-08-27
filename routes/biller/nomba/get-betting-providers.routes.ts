import express from "express";
import protect from "../../../middlewares/auth";
import getBettingProvidersHandler from "../../../handlers/billers/betting/get-betting-providers.handler";

const router = express.Router();

/**
 * @description List Nomba's betting providers — cache on the client, these
 * rarely change.
 * @route GET /api/billers/nomba/betting/providers
 * @access Private
 * @method GET
 */
router.get("/betting/providers", protect, getBettingProvidersHandler);

export default router;
