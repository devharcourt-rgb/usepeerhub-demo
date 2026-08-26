import express from "express";
import protect from "../../../middlewares/auth";
import getUsersHandlerForAdmin from "../../../handlers/admin/user/get-users.handler";

const router = express.Router();

/**
 * @description Endpoint to get all admin users
 * @method GET
 * @access Private
 * @route /v1/admin/users
 */
router.get("/", protect, getUsersHandlerForAdmin);

export default router;
