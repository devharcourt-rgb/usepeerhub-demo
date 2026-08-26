import express from "express";
import protect from "../../middlewares/auth";
import getBillersCategoriesHandler from "../../handlers/billers/getBillersCategories.handler";

const router = express.Router();

router.get("/categories", protect, getBillersCategoriesHandler);

export default router;
