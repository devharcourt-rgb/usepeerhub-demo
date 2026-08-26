import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { VirtualAccountType } from "../../types/virtual-account.type";
import { VirtualAccountModel } from "../../models/virtual-account";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { CurrencyModel } from "../../models/currency.model";
import { FlutterwaveClient } from "../../lib/flutterwave";
import { UserModel } from "../../models/user.model";
import { ROOT_USER_BVN } from "../../auto/constant";
import { RegisterSubAccountApiResponse } from "../../lib/flutterwave/types";
import { getUser } from "../../utils/core.utils";

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

async function createVirtualAccountsHandler_FlutterWave(
  req: CreateVirtualAccountsRequest,
  res: Response<VirtualAccountsResponse>,
  next: NextFunction,
): Promise<Response<VirtualAccountsResponse> | void> {
  const { userIds } = req.body;

  // Validate that userIds is an array
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

  const flwClient = new FlutterwaveClient();
  const results: VirtualAccountsResult = {
    successful: [],
    failed: [],
  };

  try {
    // Get Nigerian Naira currency ID (only need to fetch once)
    const nigerianNaira = await CurrencyModel.findOne({
      code: "NGN",
    });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Nigerian Naira currency not found",
      );
    }

    // Process each userId in the array
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

        // Check if virtual account exists and delete if found
        const virtualAccount = await VirtualAccountModel.findOne({
          user: new mongoose.Types.ObjectId(userId),
          type: VirtualAccountType.INTERNAL,
          source: "flutterwave",
        });

        if (virtualAccount) {
          await virtualAccount.deleteOne();
        }

        // Create account on Flutterwave
        const flwClientResponse = await flwClient.registerSubAccount({
          email: user.emailAddress.toString(),
          narration: `Peerhub-${user.firstName}-${user.lastName}`,
          bvn: ROOT_USER_BVN,
          is_permanent: true,
        });

        if (flwClientResponse.status !== "success") {
          results.failed.push({
            userId,
            reason: flwClientResponse.message,
          });
          continue;
        }

        const { data }: { data: RegisterSubAccountApiResponse } =
          flwClientResponse;

        // Create virtual account in database
        await VirtualAccountModel.create({
          user: userId,
          accountNumber: data.account_number,
          type: VirtualAccountType.INTERNAL,
          accountID: data.flw_ref,
          bankName: data.bank_name,
          currency: nigerianNaira._id,
          source: "flutterwave",
        });

        results.successful.push({
          userId,
          accountNumber: data.account_number,
          bankName: data.bank_name,
        });
      } catch (error) {
        // Handle individual user errors without stopping the whole process
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
    return;
  }
}

export default createVirtualAccountsHandler_FlutterWave;
