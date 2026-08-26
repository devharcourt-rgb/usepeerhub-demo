import express from "express";
import {
  checkDiscoHandler,
  providerReliabilityStatusHandler,
} from "../../../handlers/billers/buypower/check-disco";
import protect from "../../../middlewares/auth";

const router = express.Router();

router.get("/check-disco", protect, checkDiscoHandler);
router.get("/provider-status", providerReliabilityStatusHandler);

export default router;
