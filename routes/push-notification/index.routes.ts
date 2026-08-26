import express from "express";
import setTokenRoutes from "./set-token.routes";
import pingRoutes from "./ping.routes";

const router = express.Router();

router.use("/set-token", setTokenRoutes);
router.use("/ping", pingRoutes);

export default router;
