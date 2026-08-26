import express from "express";
import getMeHandlerForAdmin from "../../../handlers/admin/user/get-me.handler";
import protect from "../../../middlewares/auth";

const router = express.Router();

/**
 * @description Endpoint to get the currently logged in admin user
 * @method GET
 * @access Private
 * @route /v1/admin/users/me
 */
router.get("/me", protect, getMeHandlerForAdmin);

export default router;
