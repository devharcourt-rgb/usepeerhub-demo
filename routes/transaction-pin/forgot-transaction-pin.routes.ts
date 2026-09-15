import { Router } from "express";
import protect from "../../middlewares/auth";
import forgotTransactionPinHandler from "../../handlers/transaction-pin/forgot-transaction-pin.handler";

const router = Router();
/**
 * @description Endpoint to request a transaction pin reset OTP
 * @route /v1/transaction-pin/forgot
 * @access Private
 * @method POST
 */
router.post("/forgot", protect, forgotTransactionPinHandler);

export default router;
