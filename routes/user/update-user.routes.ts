import express from "express";
import protect from "../../middlewares/auth";
import updateUserHandler from "../../handlers/user/update-user.handler";
const router = express.Router();

/**
 * @description Endpoint to update user profile
 * @route /v1/user
 * @access Private
 * @method PATCH
 */
router.patch("/", protect, updateUserHandler);

export default router;
