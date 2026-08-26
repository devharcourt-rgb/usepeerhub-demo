import express from "express";
import protect from "../../middlewares/auth";
import logoutHandler from "../../handlers/auth/logout.handler";

const router = express.Router();

/**
 * @description Endpoint to logout
 * @route /v1/auth/logout
 * @access Private
 * @method POST
 */
router.post("/logout", protect, logoutHandler);

export default router;
