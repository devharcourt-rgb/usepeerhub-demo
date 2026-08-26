import express from "express";
const router = express.Router();

import updateUserRoutes from "./update-user.routes";
import getUsersRoutes from "./get-users.routes";
import getMeRoutes from "./get-me.routes";

router.use(updateUserRoutes);
router.use(getUsersRoutes);
router.use(getMeRoutes);

export default router;
