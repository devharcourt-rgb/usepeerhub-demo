import { Router } from "express";
import completeKycRoute from "./complete-kyc.routes";
import countryKycRoute from "./upload-country.routes";
import getUserKycRoute from "./get-user-kyc.routes";
import updateKycStatusRoute from "./update-kyc-status.routes";

const router = Router();

router.use(completeKycRoute);
router.use(countryKycRoute);
router.use(getUserKycRoute);
router.use(updateKycStatusRoute);

export default router;
