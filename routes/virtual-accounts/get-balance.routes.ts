import express from "express";
import getBalanceHandler from "../../handlers/virtual-account/get-balance.handler";
import protect from "../../middlewares/auth";

const router = express.Router();

router.get("/balance", protect, getBalanceHandler);

export default router;
