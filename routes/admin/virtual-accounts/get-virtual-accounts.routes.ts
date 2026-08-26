import { Router } from "express";
import protect from "../../../middlewares/auth";
import getVirtualAccountsHandlerForAdmin from "../../../handlers/admin/virtual-accounts/get-virtual-accounts.handler";

const router = Router();

router.get("/", protect, getVirtualAccountsHandlerForAdmin);

export default router;
