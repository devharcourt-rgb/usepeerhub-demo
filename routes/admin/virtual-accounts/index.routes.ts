import { Router } from "express";
import getVirtualAccountsRoute from "./get-virtual-accounts.routes";
import getVATransactionsRoute from "./get-va-transactions.routes";
import getVirtualAccountByIdRoute from "./get-va-by-id.routes";
import topupVirtualAccountRoute from "./topup.routes";

const router = Router();

router.use(getVirtualAccountsRoute);
router.use(getVATransactionsRoute);
router.use(getVirtualAccountByIdRoute);
router.use(topupVirtualAccountRoute);

export default router;
