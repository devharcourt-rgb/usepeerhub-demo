import { Router } from "express";
import protect from "../../../middlewares/auth";
import getCustomerForAdmin from "../../../handlers/admin/customers/get-customer.handler";

const router = Router();

/**
 * @description Endpoint to get  customer for admin
 * @method GET
 * @route /api/admin/customer/:id
 * @access Private
 */
router.get("/:id", protect, getCustomerForAdmin);

export default router;
