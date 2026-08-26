import express from "express";
import protect from "../../../middlewares/auth";
import getBettingCompainesHandler from "../../../handlers/billers/nellobytes/get-betting-companies";

const router = express.Router();

router.get("/betting", protect, getBettingCompainesHandler);

export default router;
