import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { VirtualAccountModel } from "../../../models/virtual-account";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
} from "../../../types/transaction.types";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";
import { IUser } from "../../../types/user.types";
import { CurrencyModel } from "../../../models/currency.model";
import HTTPException from "../../../utils/error.utils";

async function virtualAccountTopUpHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const { amount } = req.body;
  const { userId } = getUser(req);

  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    let virtualAccount;

    virtualAccount = await VirtualAccountModel.findById(id).populate({
      path: "user",
      select: "firstName lastName emailAddress id _id",
    });

    if (virtualAccount) {
      const nairaCurrency = await CurrencyModel.findOne({ code: "NGN" });

      if (!nairaCurrency) {
        throw new HTTPException(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          "Naira currency not found",
        );
      }

      // create credit transaction
      const creditTransaction = await TransactionModel.create({
        amount: amount * 100,
        type: TransactionType.CREDIT,
        description: "Wallet Topup",
        user: (virtualAccount.user as unknown as IUser)._id,
        status: TransactionStatus.COMPLETED,
        metadata: {
          source: "admin_topup",
          senderId: userId,
        },
        currency: nairaCurrency._id,
      });

      // send credit email to user
      queueProducer.addJob({
        name: "send-credit-email",
        data: {
          recipientEmail: (virtualAccount.user as unknown as IUser)
            .emailAddress,
          recipientFirstName: (virtualAccount.user as unknown as IUser)
            .firstName,
          amount: Number(amount).toLocaleString(),
          senderName: `Admin`,
        },
      });

      return res.status(HTTPStatus.OK).json({
        message: "Virtual Account Topup Successful",
        data: creditTransaction,
      });
    }

    const blowmoneyClient = new BlowMoneyClient();

    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    await blowmoneyClient.topUpVirtualAccount({
      id,
      amount: Number(amount),
    });

    return res.status(HTTPStatus.OK).json({
      message: "Virtual Account Topup Successful",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default virtualAccountTopUpHandlerForAdmin;
