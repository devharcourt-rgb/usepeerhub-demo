import { Router } from "express";
import setupTransactionPinRoutes from "./setup-transaction-pin.routes";
import verifyTransactionPinRoutes from "./verify-transaction-pin.routes";
import changeTransactionPinRoutes from "./change-transaction-pin.routes";
import forgotTransactionPinRoutes from "./forgot-transaction-pin.routes";
import resetTransactionPinRoutes from "./reset-transaction-pin.routes";
import authorizeTransactionPinRoutes from "./authorize-transaction-pin.routes";

const router = Router();

router.use(setupTransactionPinRoutes);
router.use(verifyTransactionPinRoutes);
router.use(changeTransactionPinRoutes);
router.use(forgotTransactionPinRoutes);
router.use(resetTransactionPinRoutes);
router.use(authorizeTransactionPinRoutes);

export default router;
