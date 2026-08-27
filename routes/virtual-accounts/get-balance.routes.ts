import express from "express";
import protect from "../../middlewares/auth";
import getBalanceHandler from "../../handlers/virtual-account/get-balance.handler";

const router = express.Router();

/**
 * @description Get the authenticated user's balance
 * @route GET /api/virtual-account/balance
 * @access Private
 * @method GET
 */
router.get("/balance", protect, getBalanceHandler);

export default router;
