import express from "express";
// import adminTeamRoutes from "./team/index.route";
// import adminAuthRoutes from "./auth/index.routes";
// import adminRolesRoutes from "./roles/index.routes";
// import adminTransactionsRoutes from "./transactions/index.routes";
// import adminKycRoutes from "./kyc/index.routes";
// import adminUserRoutes from "./user/index.routes";
// import adminSystemInfoRoutes from "./system-info/index.routes";
// import adminAnalyticsRoutes from "./analytics/index.routes";
import adminCryptoRoutes from "./crypto/index.routes";

const router = express.Router();

// router.use("/team", adminTeamRoutes);
// router.use("/auth", adminAuthRoutes);
// router.use("/roles", adminRolesRoutes);
// router.use("/transactions", adminTransactionsRoutes);
// router.use("/kycs", adminKycRoutes);
// router.use("/users", adminUserRoutes);
// router.use("/system-info", adminSystemInfoRoutes);
// router.use("/analytics", adminAnalyticsRoutes);
router.use("/crypto", adminCryptoRoutes);

export default router;
