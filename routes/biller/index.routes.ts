import { Router } from "express";
const router = Router();

import nombaRoutes from "./nomba/index.routes";

router.use("/nomba", nombaRoutes);

export default router;
