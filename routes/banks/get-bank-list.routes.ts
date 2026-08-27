import express from "express";
import protect from "../../middlewares/auth";
import getBankListHandler from "../../handlers/banks/get-bank-list";

const router = express.Router();

/**
 * @description Get list of banks supported for transfers
 * @route GET /api/banks
 * @access Private
 * @method GET
 */
router.get("/", protect, getBankListHandler);

export default router;
