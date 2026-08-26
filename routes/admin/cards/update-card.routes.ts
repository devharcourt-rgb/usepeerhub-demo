import { Router } from "express";
import protect from "../../../middlewares/auth";
import updateCardForAdminHandler from "../../../handlers/admin/cards/update-card.handler";

const router = Router();

router.patch("/:id", protect, updateCardForAdminHandler);

export default router;
