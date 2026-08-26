import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { TransactionModel } from "../../models/transaction.model";
import { HTTPStatus } from "../../utils/http.utils";

async function flagTransactionHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;
  const { flag } = req.body;

  try {
    // converts the string to a boolean
    const parsedFlagValue = JSON.parse(flag);

    const transaction = await TransactionModel.findById(id).populate("user");

    if (!transaction) {
      return res.status(HTTPStatus.NOT_FOUND).json({
        message: "Transaction not found",
      });
    }

    transaction.flagged = parsedFlagValue;
    transaction.flaggedBy = userId;
    await transaction.save();

    res.status(HTTPStatus.OK).json({
      message: "Transaction flagged",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default flagTransactionHandler;
