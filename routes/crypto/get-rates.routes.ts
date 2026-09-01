import express from "express";
import protect from "../../middlewares/auth";
import getRatesHandler from "../../handlers/crypto/get-rates.handler";

const router = express.Router();

/**
 * @description List the current NGN rate for each active crypto asset
 * @route GET /v1/crypto/rates
 * @access Private
 * @method GET
 */
router.get("/rates", protect, getRatesHandler);

export default router;
