import express from "express";
import protect from "../../middlewares/auth";
import getMeHandler from "../../handlers/user/get-me.handler";

const router = express.Router();

/**
 * @description Endpoint to get the current authenticated user's information
 * @route /v1/user/me
 * @access Private
 * @method GET
 */
router.get("/me", protect, getMeHandler);

export default router;
