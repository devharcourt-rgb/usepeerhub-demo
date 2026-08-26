import express from "express";
import protect from "../../middlewares/auth";
import getBankListHandler from "../../handlers/virtual-account/cashonrails/get-bank-list";

const router = express.Router();

/**
 * @description Get list of banks for virtual account creation
 * @route GET /api/virtual-accounts/banks
 * @access Private
 * @method GET
 */
router.get("/banks", protect, getBankListHandler);

export default router;
