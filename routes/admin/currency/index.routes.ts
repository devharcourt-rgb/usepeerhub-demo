import express from "express";
import setRateRoutes from "./set-rate.routes";

const router = express.Router();

router.use(setRateRoutes);

export default router;
