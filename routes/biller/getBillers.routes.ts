import express from "express";
import protect from "../../middlewares/auth";
import getBillersHandler from "../../handlers/billers/getBillers.handlers";

const router = express.Router();

router.get("/", protect, getBillersHandler);

export default router;
