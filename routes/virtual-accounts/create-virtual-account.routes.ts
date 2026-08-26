import express from "express";
import protect from "../../middlewares/auth";
import createVirtualAccountsHandler_FlutterWave from "../../handlers/virtual-account/create-virtual-account.handler";
import createVirtualAccountsHandler_CashOnRail from "../../handlers/virtual-account/cashonrails";
import adminProtect from "../../middlewares/admin";

const router = express.Router();

/**
 * @description Create Virtual Account
 * @route /v1/virtual-account/
 * @version 1.0.1 this set a default but use params to select a provider
 * @access Private
 * @method POST
 *
 */
router.post("/", protect, createVirtualAccountsHandler_CashOnRail);

router.post(
  "/flutterwave",
  adminProtect,
  createVirtualAccountsHandler_FlutterWave,
);
router.post(
  "/cashonrails",
  adminProtect,
  createVirtualAccountsHandler_CashOnRail,
);

export default router;
