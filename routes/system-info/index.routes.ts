import { Router } from "express";
import getSystemInfoRoute from "./system-info.route";

const router = Router();

router.use(getSystemInfoRoute);

export default router;
