import { VirtualAccountModel } from "../models/virtual-account";
import mongoose from "mongoose";
import { VirtualAccountType } from "../types/virtual-account.type";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";
import { getBalancePipeline } from "../handlers/virtual-account/pipelines/get-balance-pipeline";
import { TransactionModel } from "../models/transaction.model";
import { IUser } from "../types/user.types";
import { CurrencyModel } from "../models/currency.model";
import { NombaClient } from "../lib/nomba";
import { ROOT_USER_BVN } from "../auto/constant";

const NOMBA_SOURCE = "nomba";

const nombaClient = new NombaClient();

export class VirtualAccountService {
  constructor() {}

  async getBalanceForUser(userId: string) {
    const aggregation = getBalancePipeline({
      user: new mongoose.Types.ObjectId(userId),
    });

    const aggregationData = await TransactionModel.aggregate(aggregation);

    return aggregationData.length ? aggregationData[0] : { balance: 0 };
  }

  async createVirtualAccount(user: IUser) {
    if (!user || !user._id)
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "ID not found");

    const existing = await VirtualAccountModel.findOne({
      user: new mongoose.Types.ObjectId(user._id.toString()),
      type: VirtualAccountType.INTERNAL,
      source: NOMBA_SOURCE,
    });

    if (existing) {
      return existing;
    }

    const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

    if (!nigerianNaira) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Nigerian Naira currency not found",
      );
    }

    // accountRef must be 16-64 chars — a plain user id could fall short of
    // that if the id format ever changes, so prefix it.
    const accountRef = `peerhub-${user._id.toString()}`;
    // accountName must be 8-64 chars — the prefix alone clears the minimum
    // even if the user's name is short.
    const accountName = `PeerHub-${user.firstName}-${user.lastName}`;

    const nombaResponse = await nombaClient.createVirtualAccount({
      accountRef,
      accountName,
      bvn: ROOT_USER_BVN,
    });

    const { data } = nombaResponse;

    return VirtualAccountModel.create({
      user: user._id,
      accountNumber: data.bankAccountNumber,
      type: VirtualAccountType.INTERNAL,
      accountID: data.accountRef,
      bankName: data.bankName,
      currency: nigerianNaira._id,
      source: NOMBA_SOURCE,
    });
  }
}
