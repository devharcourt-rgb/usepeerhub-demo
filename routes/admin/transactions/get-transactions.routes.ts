import { Router } from "express";
import protect from "../../../middlewares/auth";
import getTransactionsHandlerForAdmin from "../../../handlers/admin/transactions/get-transactions.handler";

const router = Router();

/**
 * @description  Endpoint for an admin to get all transactions
 * @access Private
 * @route /v1/admin/transactions
 * @method GET
 */
router.get("/", protect, getTransactionsHandlerForAdmin);

export default router;
