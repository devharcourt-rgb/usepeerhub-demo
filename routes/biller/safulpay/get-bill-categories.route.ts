import express from "express";
import getSafulpayBillCategoriesHandler from "../../../handlers/billers/safulpay/get-bill-categories";
import protect from "../../../middlewares/auth";

const router = express.Router();

router.get("/categories", protect, getSafulpayBillCategoriesHandler);

export default router;
