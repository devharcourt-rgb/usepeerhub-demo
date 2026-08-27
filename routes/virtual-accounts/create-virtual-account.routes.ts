import express from "express";
import protect from "../../middlewares/auth";
import createVirtualAccountHandler from "../../handlers/virtual-account/create-virtual-account.handler";

const router = express.Router();

/**
 * @description Create a virtual account (Nomba) for the authenticated user
 * @route POST /api/virtual-account
 * @access Private
 * @method POST
 */
router.post("/", protect, createVirtualAccountHandler);

export default router;
