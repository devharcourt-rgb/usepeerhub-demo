import { Router } from "express";
import protect from "../../../middlewares/auth";
import blockCardForAdminHandler from "../../../handlers/admin/cards/block-card.handler";

const router = Router();

router.post("/:id/block", protect, blockCardForAdminHandler);

export default router;
