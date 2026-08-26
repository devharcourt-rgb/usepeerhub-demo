import { Router } from "express";
import protect from "../../../middlewares/auth";
import getAllCardsForAdminHandler from "../../../handlers/admin/cards/get-cards.handler";

const router = Router();

router.get("/", protect, getAllCardsForAdminHandler);

export default router;
