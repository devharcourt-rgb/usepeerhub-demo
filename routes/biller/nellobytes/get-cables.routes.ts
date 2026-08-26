import express from "express";
import protect from "../../../middlewares/auth";
import getCablesHandler from "../../../handlers/billers/nellobytes/get-cables.handler";

const router = express.Router();

router.get("/cables", protect, getCablesHandler);

export default router;
