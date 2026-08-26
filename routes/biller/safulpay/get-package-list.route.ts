import express from "express";
import protect from "../../../middlewares/auth";
import getSafulpayPackageListHandler from "../../../handlers/billers/safulpay/package-list";

const router = express.Router();

router.get("/package-list", protect, getSafulpayPackageListHandler);

export default router;
