import { NextFunction, Request, Response } from "express";
import BuyPowerClient from "../../../lib/buypower";
import { detectFraud, getUser, logout } from "../../../utils/core.utils";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import { getBalanceForUser } from "../../../utils/virtual-account.util";
import { TransactionModel } from "../../../models/transaction.model";
import {
  TransactionStatus,
  TransactionType,
  TransactionDescription,
} from "../../../types/transaction.types";
import { ROOT_USER } from "../../../auto/constant";
import { ActivityLogModel } from "../../../models/activity-log.model";
import { Activity } from "../../../types/activity-log.types";
import { toLocalPhoneNo } from "../../../utils/formatter.utils";
import { NotificationService } from "../../../utils/notification.utils";
import { CurrencyModel } from "../../../models/currency.model";

const notificationService = NotificationService.getInstance();

async function create(req: Request, res: Response, next: NextFunction) {
  const buyPowerClient = new BuyPowerClient();
  const {
    smartCard,
    provider,
    amount,
    tariffClass,
    vendType = "PREPAID",
    vertical = "TV",
  } = req.body;
  const { userId } = getUser(req);

  try {
    const parsedAmount = parseFloat(amount);
    const parsedAmountInKobo = parsedAmount * 100;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "User not found");
    }

    if (user.status !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Your account is not active. Please verify your account"
      );
    }

    if (parsedAmount < 50) {
      throw new HTTPException(
        HTTPStatus.BAD_GATEWAY,
        "Amount should be greater than 50"
      );
    }

    const { balance } = await getBalanceForUser(userId);

    if (parsedAmountInKobo > balance) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Insufficient funds");
    }

    const buyPowerWallet = await buyPowerClient.getWalletBalance();

    /**Converts buy power wallet balance to kobo */
    if (parsedAmountInKobo > buyPowerWallet.balance * 100) {
      //TODO: Added Side Effect
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Error processing request. Please try again later"
      );
    }
    const ip = req.ip || req.connection.remoteAddress;
    const cleanIP = ip!.replace("::ffff:", ""); // IPv4 compatibility

    const isFraudulent = await detectFraud(userId, cleanIP);

    if (isFraudulent) {
      const user = await UserModel.findById(userId);
      user?.suspendAccount();

      logout(req, res);
    }

    const nairaCurrency = await CurrencyModel.findOne({ code: "NGN" });

    // create a debit transaction with a status of processing
    const tx = await TransactionModel.create({
      user: userId,
      amount: parsedAmount * 100,
      type: TransactionType.DEBIT,
      description: TransactionDescription.CABLE,
      status: TransactionStatus.PROCESSING,
      currency: nairaCurrency?._id,
    });

    const req_phone = toLocalPhoneNo(
      (user.phoneNumber as string) || ROOT_USER.phoneBP
    );
    const response = await buyPowerClient.vendTV({
      meter: smartCard,
      disco: provider,
      vendType,
      vertical,
      amount: parsedAmount,
      orderId: tx._id.toString(),
      phone: req_phone,
      paymentType: "ONLINE",
      tariffClass: tariffClass || req.body.package,
    });

    if (response.status !== true) {
      tx.status = TransactionStatus.FAILED; // TODO: Not Failed
      // Add Auto Retry
      await tx.save();

      throw new HTTPException(HTTPStatus.BAD_REQUEST, response.message);
    }

    tx.status = TransactionStatus.COMPLETED;

    await tx.save();

    // add metadata to the transaction
    tx.metadata = response.data;

    // creates activity log
    await ActivityLogModel.create({
      user: userId,
      action: Activity.BILL_PAYMENT,
    });
    await notificationService
      .sendToUser(
        user._id.toString(),
        "It showtime, Tv has been purchase",
        `Your ${provider} sub of ₦${Number(
          parsedAmount
        ).toLocaleString()} has been successfully purchase`
      )
      .catch((err) => {
        console.error("Unable to send push notification:", err);
      });
    return res.status(HTTPStatus.OK).json({
      message: "TV sub purchased successfully",
      data: response.data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export default create;
