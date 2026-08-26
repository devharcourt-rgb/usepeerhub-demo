import { Router } from "express";
const router = Router();

import getBillersRoute from "./getBillers.routes";
import getBillersCategoriesRoute from "./getBillersCategories.routes";
import validateCustomerDetailRoute from "./validateCustomerDetail.routes";
import getSingleBillerRoute from "./getSingleBiller.routes";
import getBillerByCategoryRoute from "./billerByCategory.routes";
import getBillerProductsRoute from "./getBillerProducts.routes";
import createBillOrderRoute from "./createBillOrder.routes";
import nellobyteaRoutes from "./nellobytes/index.routes";
import buyPowerRoutes from "./buypower/index.routes";
import safulpayRoutes from "./safulpay/index.route";

router.use(getBillersRoute);
router.use(nellobyteaRoutes);
router.use(getBillersCategoriesRoute);
router.use(validateCustomerDetailRoute);
router.use(createBillOrderRoute);
router.use(getBillerProductsRoute);
router.use(getSingleBillerRoute);
router.use(getBillerByCategoryRoute);
router.use(buyPowerRoutes);
router.use(safulpayRoutes);

export default router;
