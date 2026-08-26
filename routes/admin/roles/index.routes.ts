import express from "express";
import adminRolesRoutes from "./get-roles.routes";

const router = express.Router();

router.use(adminRolesRoutes);

export default router;
