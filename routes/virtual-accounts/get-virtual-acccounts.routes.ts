import express from "express";
import getVirtualAccountsHandler from "../../handlers/virtual-account/get-virtual-accounts.handler";
import adminProtect from "../../middlewares/admin";

const router = express.Router();

/**
 * @description Get all Virtual Accounts for admin
 * @route /v1/virtual-account/all
 * @access Private
 * @method GET
 *
 */
router.get("/all", adminProtect, getVirtualAccountsHandler);

export default router;
