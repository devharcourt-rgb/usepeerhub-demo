import express from "express";
import getBankListRoutes from "./get-bank-list.routes";
import validateAccountRoutes from "./validate-account.routes";
import transferRoutes from "./transfer.routes";

const router = express.Router();

router.use(getBankListRoutes);
router.use(validateAccountRoutes);
router.use(transferRoutes);

export default router;
