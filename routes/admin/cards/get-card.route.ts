import { Router } from "express";
import protect from "../../../middlewares/auth";
import getCardForAdminHandler from "../../../handlers/admin/cards/get-card.handler";

const router = Router();

router.get("/:id", protect, getCardForAdminHandler);

export default router;
