import { Router } from "express";
import protect from "../../../middlewares/auth";
import activateCardForAdminHandler from "../../../handlers/admin/cards/activate-card.handler";

const router = Router();

router.post("/:id/activate", protect, activateCardForAdminHandler);

export default router;
