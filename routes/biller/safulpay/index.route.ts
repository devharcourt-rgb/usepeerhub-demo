import { Router } from "express";
const router = Router();

import getBillCategoriesRoute from "./get-bill-categories.route";
import createOutflowRoute from "./create-outflow.route";
import validateRoute from "./validate.route";
import getPackageListRoute from "./get-package-list.route";

router.use("/sp", getPackageListRoute);
router.use("/sp", getBillCategoriesRoute);
router.use("/sp", createOutflowRoute);
router.use("/sp", validateRoute);

export default router;
