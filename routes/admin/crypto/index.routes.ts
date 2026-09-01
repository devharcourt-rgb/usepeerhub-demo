import express from "express";
import getAssetsRoutes from "./get-assets.routes";
import createAssetRoutes from "./create-asset.routes";
import updateAssetRoutes from "./update-asset.routes";
import setRateRoutes from "./set-rate.routes";
import getDepositsRoutes from "./get-deposits.routes";

const router = express.Router();

router.use("/assets", getAssetsRoutes);
router.use("/assets", createAssetRoutes);
router.use("/assets", updateAssetRoutes);
router.use("/assets", setRateRoutes);
router.use(getDepositsRoutes);

export default router;
