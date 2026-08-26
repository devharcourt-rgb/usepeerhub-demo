import { Router } from "express";
import getUserRoutes from "./get-user.routes";
import getMeRoutes from "./get-me.routes";
import getUsersRoutes from "./get-users.routes";

const router = Router();

router.use(getUserRoutes);
router.use(getMeRoutes);
router.use(getUsersRoutes);

export default router;
