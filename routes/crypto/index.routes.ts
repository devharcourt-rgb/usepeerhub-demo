import express from "express";
import getAssetsRoutes from "./get-assets.routes";
import createDepositRoutes from "./create-deposit.routes";
import getDepositsRoutes from "./get-deposits.routes";
import getChainsRoutes from "./get-chains.routes";
import getRatesRoutes from "./get-rates.routes";

const router = express.Router();

router.use(getAssetsRoutes);
router.use(createDepositRoutes);
router.use(getDepositsRoutes);
router.use(getChainsRoutes);
router.use(getRatesRoutes);

export default router;
