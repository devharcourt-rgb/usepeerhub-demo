import { Router } from "express";
import getAllKycRoutes from "./get-all-kyc.routes";
import getKycByIdRoutes from "./get-kyc-by-id.routes";
import updateKycStatusRoutes from "./update-kyc-status.routes";

const router = Router();

router.use(getAllKycRoutes);
router.use(getKycByIdRoutes);
router.use(updateKycStatusRoutes);

export default router;
