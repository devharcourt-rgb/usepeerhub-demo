import express from "express";
import getSingleTransactionHandler from "../../handlers/transaction/get-transaction.handler";
import adminProtect from "../../middlewares/admin";
const router = express.Router();

/**
 * @description Get transaction by id
 * @access Private
 * @method Get
 * @route /transactions/:id
 */
router.get("/:id", adminProtect, getSingleTransactionHandler);

export default router;
