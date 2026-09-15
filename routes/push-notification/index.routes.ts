import express from "express";
import setTokenRoutes from "./set-token.routes";
import pingRoutes from "./ping.routes";

const router = express.Router();

router.use(setTokenRoutes);
router.use(pingRoutes);

export default router;
