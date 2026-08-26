import { UserModel } from "../models/user.model";
import { auditAndSuspendSuspiciousAccounts } from "../utils/security.utils";

(async () => {
  const results = await auditAndSuspendSuspiciousAccounts(UserModel);
  console.log(
    `Suspended ${results.totalAccountsSuspended} suspicious accounts`
  );
})();
