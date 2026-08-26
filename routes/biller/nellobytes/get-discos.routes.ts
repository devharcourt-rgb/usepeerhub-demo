import express from "express";
import protect from "../../../middlewares/auth";
import getElectricityDiscosHandler from "../../../handlers/billers/nellobytes/get-discos.handler";

const router = express.Router();

router.get("/discos", protect, getElectricityDiscosHandler);

export default router;
