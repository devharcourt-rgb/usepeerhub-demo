import express from "express";
import getBalanceRoutes from "./get-balance.routes";
import getVirtualAccountRoutes from "./get-virtual-acccount.routes";
import createVirtualAccountRoutes from "./create-virtual-account.routes";
import getVirtualAccountsRoutes from "./get-virtual-acccounts.routes";
import transferRoutes from "./transfer.routes";
import getBankListRoutes from "./get-bank-list.routes";
import validateAccountRoutes from "./validate-account.routes";

const router = express.Router();

router.use(getBalanceRoutes);
router.use(getVirtualAccountRoutes);
router.use(createVirtualAccountRoutes);
router.use(getVirtualAccountsRoutes);
router.use(transferRoutes);
router.use(getBankListRoutes);
router.use(validateAccountRoutes);

export default router;
