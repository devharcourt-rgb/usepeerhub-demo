import express from "express";
import checkDiscoRoute from "./check-disco.routes";
import checkMeterRoute from "./check-meter.routes";
import vendElectricityRoute from "./vend-electricity.routes";
import vendAirtimeRoute from "./vend-airtime.routes";
import vendDataRoute from "./vend-data.routes";
import vendTVRoute from "./vend-tv.routes";
import priceListRoute from "./price-list.routes";
import reQueryRoute from "./re-query";

const router = express.Router();

router.use("/bp", checkDiscoRoute);
router.use("/bp", checkMeterRoute);
router.use("/bp", vendElectricityRoute);
router.use("/bp", reQueryRoute);
router.use("/bp", vendAirtimeRoute);
router.use("/bp", vendDataRoute);
router.use("/bp", vendTVRoute);
router.use("/bp", priceListRoute);

export default router;
