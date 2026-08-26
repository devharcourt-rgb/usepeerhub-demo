import express from "express";
import protect from "../../../middlewares/auth";
import getRolesHandler from "../../../handlers/admin/roles/get-roles.handler";
const router = express.Router();

router.get("/", protect, getRolesHandler);

export default router;
