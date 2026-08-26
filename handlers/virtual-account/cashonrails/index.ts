import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { VirtualAccountType } from "../../../types/virtual-account.type";
import { VirtualAccountModel } from "../../../models/virtual-account";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { CurrencyModel } from "../../../models/currency.model";
import { UserModel } from "../../../models/user.model";
import { createOrGetReservedAccount } from "../../../services/cashonrails.service";

interface CreateVirtualAccountsRequest extends Request {
  body: {
    userIds: string[];
  };
}

interface SuccessfulAccount {
  userId: string;
  accountNumber: string;
  bankName: string;
}

interface FailedAccount {
  userId: string;
  reason: string;
}

interface VirtualAccountsResult {
  successful: SuccessfulAccount[];
  failed: FailedAccount[];
}

interface VirtualAccountsResponse {
  message: string;
  data: {
    successCount: number;
    failCount: number;
    successful: SuccessfulAccount[];
    failed: FailedAccount[];
  };
}

async function createVirtualAccountsHandler_CashOnRail(
  req: CreateVirtualAccountsRequest,
  res: Response<VirtualAccountsResponse>,
  next: NextFunction,
): Promise<Response<VirtualAccountsResponse> | void> {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(HTTPStatus.BAD_REQUEST).json({
      message: "userIds must be a non-empty array",
      data: {
        successCount: 0,
        failCount: 0,
        successful: [],
        failed: [],
      },
    });
  }

  const results: VirtualAccountsResult = {
    successful: [],
    failed: [],
  };

  try {
    const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Nigerian Naira currency not found",
      );
    }

    for (const userId of userIds) {
      try {
        const user = await UserModel.findById(userId);

        if (!user) {
          results.failed.push({
            userId,
            reason: "User not found",
          });
          continue;
        }

        const virtualAccount = await VirtualAccountModel.findOne({
          user: new mongoose.Types.ObjectId(userId),
          type: VirtualAccountType.INTERNAL,
          source: "cashonrails",
        });

        if (virtualAccount) {
          results.successful.push({
            userId,
            accountNumber: String(virtualAccount.accountNumber),
            bankName: virtualAccount.bankName,
          });
          continue;
        }

        const reservedAccount = await createOrGetReservedAccount(user);

        const accountData = reservedAccount.data;

        if (
          !accountData ||
          !accountData.accountNumber ||
          !accountData.bankName
        ) {
          results.failed.push({
            userId,
            reason: "Invalid reserved account data from CashOnRails",
          });
          continue;
        }

        await VirtualAccountModel.create({
          user: userId,
          accountNumber: accountData.accountNumber,
          type: VirtualAccountType.INTERNAL,
          accountID: accountData.id,
          bankName: accountData.bankName,
          currency: nigerianNaira._id,
          source: "cashonrails",
        });

        results.successful.push({
          userId,
          accountNumber: accountData.account_number,
          bankName: accountData.bank_name,
        });
      } catch (error) {
        console.log(error);
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(HTTPStatus.CREATED).json({
      message: "Virtual accounts processing completed",
      data: {
        successCount: results.successful.length,
        failCount: results.failed.length,
        successful: results.successful,
        failed: results.failed,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default createVirtualAccountsHandler_CashOnRail;
