import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { TransactionModel } from "../../../models/transaction.model";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getTransactionHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  try {
    const blowmoneyClient = new BlowMoneyClient();

    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let transaction = {};

    const blowappResponse = await TransactionModel.findById(id).populate(
      "user"
    );

    if (blowappResponse) {
      transaction = blowappResponse;
    } else {
      const blowmoneyResponse = await blowmoneyClient.getTransactionById(id);
      transaction = blowmoneyResponse.data;
    }

    res.status(HTTPStatus.OK).json({
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export default getTransactionHandlerForAdmin;
