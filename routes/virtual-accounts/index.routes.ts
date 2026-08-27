import express from "express";
import createVirtualAccountRoutes from "./create-virtual-account.routes";
import getBalanceRoutes from "./get-balance.routes";

const router = express.Router();

router.use(createVirtualAccountRoutes);
router.use(getBalanceRoutes);

export default router;
