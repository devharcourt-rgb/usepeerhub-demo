import { Router } from "express";
import protect from "../../../middlewares/auth";
import getCustomersForAdmin from "../../../handlers/admin/customers/get-customers.handler";

const router = Router();

/**
 * @description Endpoint to get all customers for admin
 * @method GET
 * @route /api/admin/customers
 * @access Private
 */
router.get("/", protect, getCustomersForAdmin);

export default router;
