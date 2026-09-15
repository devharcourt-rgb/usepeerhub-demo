import { NextFunction, Request, Response } from "express";
import { getUser } from "../utils/core.utils";
import { consumeTransactionAuthorizationToken } from "../utils/transaction-authorization.utils";

/**
 * Guards a transaction endpoint behind a transaction-pin authorization token.
 *
 * Usage: the client first calls `POST /transaction-pin/authorize` with the
 * user's pin, this same `action` string, and the exact payload it intends to
 * send to the guarded endpoint. It then attaches the returned token as
 * `transactionToken` on the actual request (e.g. the bank transfer or bill
 * payment call). The token is single-use and bound to both the action and
 * the payload, so it can't be replayed for a different transaction, and the
 * raw pin never has to reach this endpoint.
 *
 * Example:
 *   router.post(
 *     "/",
 *     protect,
 *     requireTransactionAuthorization("bank-transfer"),
 *     transferHandler,
 *   );
 */
function requireTransactionAuthorization(
  action: string,
  tokenField: string = "transactionToken",
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getUser(req);
      const token = req.body?.[tokenField];

      const payload = { ...req.body };
      delete payload[tokenField];

      const result = await consumeTransactionAuthorizationToken({
        token,
        userId,
        action,
        payload,
      });

      if (!result.valid) {
        return res.status(401).json({ message: result.message });
      }

      next();
    } catch (error) {
      console.error("Error verifying transaction authorization:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

export default requireTransactionAuthorization;
