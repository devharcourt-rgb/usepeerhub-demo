import { Router } from "express";
import updateSystemInfoRoute from "./update-system-info.route";
import getSystemInfoRoute from "./get-system-info.route";

const router = Router();

router.use(updateSystemInfoRoute);
router.use(getSystemInfoRoute);

export default router;
