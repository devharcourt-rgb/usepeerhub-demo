import express from "express";
import protect from "../../middlewares/auth";
import multer from "multer";
import completeKycHandler from "../../handlers/kyc/complete-kyc.handler";
import countrySetHandler from "../../handlers/kyc/set-user-country.handler";
const router = express.Router();

const upload = multer({ dest: "uploads/" });

/**
 * @description Endpoint to complete kyc
 * @route /v1/kyc/country
 * @access Private
 * @method POST
 */
router.post(
  "/country",
  protect,
  countrySetHandler,
);

export default router;
