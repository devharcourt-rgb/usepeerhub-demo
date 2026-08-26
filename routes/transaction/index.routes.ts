import express from "express";
import getTransactionsRoute from "./get-transactions.routes";
import getTransactionRoute from "./get-transaction.routes";
import getTransactionsAnalysisRoute from "./get-transactions-analysis.routes";
import flagTransactionRoute from "./flag-transaction.routes";

const router = express.Router();

router.use(getTransactionsAnalysisRoute);
router.use(getTransactionsRoute);
router.use(flagTransactionRoute);
router.use(getTransactionRoute);

export default router;
