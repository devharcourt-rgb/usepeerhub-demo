import express from "express";
import getUsersHandler from "../../handlers/admin/user/get-users.handler";
import adminProtect from "../../middlewares/admin";

const router = express.Router();

/**
 * @description Endpoint to get all users (admin only)
 * @route /v1/user/all
 * @access Private (Admin only)
 * @method GET
 */
router.get("/all", adminProtect, getUsersHandler);

export default router;
