import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { VirtualAccountModel } from "../../../models/virtual-account";
import { HTTPStatus } from "../../../utils/http.utils";
import { TransactionModel } from "../../../models/transaction.model";

async function getVATransactionsHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.query;
  const { userId } = getUser(req);

  try {
    // allow all admin to access virtual account transactions
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    const virtualAccount = await VirtualAccountModel.findById(id);

    if (!virtualAccount) {
      return res.status(HTTPStatus.BAD_REQUEST).json({
        message: "Virtual Account not found",
      });
    }

    const transactions = await TransactionModel.find({
      user: virtualAccount.user,
    });

    return res.status(HTTPStatus.OK).json({
      message: "Virtual Account Transactions",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

export default getVATransactionsHandlerForAdmin;
