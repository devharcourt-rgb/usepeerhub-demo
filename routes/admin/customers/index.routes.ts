import { Router } from "express";
import getCustomersRoutes from "./get-customers.routes";
import createCustomerRoutes from "./create-customer.routes";
import updateCustomerStatusRoutes from "./update-customer-status.routes";
import getCustomerRoute from "./get-customer.routes";

const router = Router();

router.use(getCustomersRoutes);
router.use(createCustomerRoutes);
router.use(updateCustomerStatusRoutes);
router.use(getCustomerRoute);

export default router;
