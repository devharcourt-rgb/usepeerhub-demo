import express from "express";
import protect from "../../middlewares/auth";
import multer from "multer";
import completeKycHandler from "../../handlers/kyc/complete-kyc.handler";
const router = express.Router();

const upload = multer({ dest: "uploads/" });

/**
 * @description Endpoint to complete kyc
 * @route /v1/kyc/complete
 * @access Private
 * @method POST
 */
router.post(
  "/complete",
  protect,
  upload.fields([
    { name: "documentImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  completeKycHandler
);

export default router;
