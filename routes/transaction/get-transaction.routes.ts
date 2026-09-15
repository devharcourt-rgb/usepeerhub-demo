import express from "express";
import getSingleTransactionHandler from "../../handlers/transaction/get-transaction.handler";
import protect from "../../middlewares/auth";
const router = express.Router();

/**
 * @description Get transaction by id
 * @access Private
 * @method Get
 * @route /transactions/:id
 */
router.get("/:id", protect, getSingleTransactionHandler);

export default router;
