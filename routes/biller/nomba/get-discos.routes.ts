import express from "express";
import protect from "../../../middlewares/auth";
import getDiscosHandler from "../../../handlers/billers/electricity/get-discos.handler";

const router = express.Router();

/**
 * @description List Nomba's electricity discos — cache on the client,
 * these rarely change.
 * @route GET /api/billers/nomba/electricity/discos
 * @access Private
 * @method GET
 */
router.get("/electricity/discos", protect, getDiscosHandler);

export default router;
