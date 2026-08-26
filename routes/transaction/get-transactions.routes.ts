import express from "express";
import protect from "../../middlewares/auth";
import getTransactionsHandler from "../../handlers/transaction/get-transactions.handler";
const router = express.Router();

/**
 * @description Get all transactions for a user
 * @access Private
 * @method Get
 * @route /transactions
 */
router.get("/", protect, getTransactionsHandler);

export default router;
