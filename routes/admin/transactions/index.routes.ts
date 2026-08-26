import { Router } from "express";

import getTransactionRoute from "./get-transaction.routes";
import getTransactionsRoute from "./get-transactions.routes";
import getTransactionAnalyticsRoute from "./get-transaction-analytics.routes";
import getTransactionReceiptRoute from "./generate-receipt.routes";
import updateTransactionRoute from "./update-transaction.routes";

const router = Router();

router.use(updateTransactionRoute);
router.use(getTransactionsRoute);
router.use(getTransactionAnalyticsRoute);
router.use(getTransactionRoute);
router.use(getTransactionReceiptRoute);

export default router;
