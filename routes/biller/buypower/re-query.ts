import express from "express";
import protect from "../../../middlewares/auth";
import reQueryHandler from "../../../handlers/billers/buypower/re-query";

const router = express.Router();

router.get("/re-query/:id", protect, reQueryHandler);

export default router;
