import express from "express";
import protect from "../../middlewares/auth";
import getVirtualAccountHandler from "../../handlers/virtual-account/get-virtual-account.handler";
import getVirtualAccountSourceHandler from "../../handlers/virtual-account/get-virtual-account-source.handler";

const router = express.Router();

/**
 * @description Get Virtual Account Information
 * @route /v1/virtual-account/
 * @access Private
 * @method GET
 *
 */
router.get("/", protect, getVirtualAccountHandler);
router.get("/source", protect, getVirtualAccountSourceHandler);

export default router;
