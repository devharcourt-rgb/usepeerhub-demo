import express from "express";
import protect from "../../../middlewares/auth";
import getElectricityTokenHandler from "../../../handlers/billers/nellobytes/get-token.handler";

const router = express.Router();

router.get("/:id/token", protect, getElectricityTokenHandler);

export default router;
