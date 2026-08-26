import { CashOnRails } from "../lib/cashonrails";
import { cashOnRailsUsersModel } from "../models/cors-user.model";
import { ROOT_USER, ROOT_USER_BVN } from "../auto/constant";
import { VirtualAccountModel } from "../models/virtual-account";
import { VirtualAccountType } from "../types/virtual-account.type";
import { CurrencyModel } from "../models/currency.model";
import { IUser } from "../types/user.types";

const cashOnRails = new CashOnRails();

export const createOrGetReservedAccount = async (
  user: any,
  force_create: boolean = false,
) => {
  let existingAccount = await cashOnRailsUsersModel.findOne({
    user_id: user._id,
  });

  const nigerianNaira = await CurrencyModel.findOne({ code: "NGN" });

  if (!nigerianNaira) {
    return;
  }

  let customer_code;

  if (!existingAccount) {
    const customerPayload = {
      email: user.emailAddress || ROOT_USER.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phoneNumber || ROOT_USER.phoneNumber,
      dob: ROOT_USER.dateOfBirth.toISOString().split("T")[0],
      bvn: ROOT_USER_BVN,
    };

    const customerResponse = await cashOnRails.CreateCustomer(customerPayload);

    customer_code = customerResponse.data.customer_code;

    await cashOnRailsUsersModel.create({
      user_id: user._id,
      customer_code,
    });
  } else {
    customer_code = existingAccount.customer_code;
  }
  const provider = await getAvailableProvider();

  const reservedAccountPayload = {
    customer_code: customer_code,
    provider,
    id: String(user._id),
  };

  const reservedAccount = await cashOnRails.ReservedAccount(
    reservedAccountPayload,
  );

  if (force_create) {
    await VirtualAccountModel.create({
      user: user._id,
      accountNumber: reservedAccount.data.accountNumber,
      type: VirtualAccountType.INTERNAL,
      accountID: reservedAccount.data.id,
      bankName: reservedAccount.data.bankName,
      currency: nigerianNaira._id,
      source: "cashonrails",
    });
  }

  return reservedAccount;
};

const getAvailableProvider = async (): Promise<string> => {
  try {
    const response = await cashOnRails.ReadVirtualAccountProvider();
    const providers: Array<{ code: string }> = response.data;
    const preferred = providers.find((p) => p.code === "bank78");

    if (preferred) {
      return preferred.code;
    }
    return providers.length > 0 ? providers[0].code : "safehaven";
  } catch (error) {
    console.error("Failed to fetch providers, defaulting to safeheaven");
    return "safehaven";
  }
};

export const getBankList = async (currency = "NGN") => {
  const response = await cashOnRails.GetBankList();
  return response.data;
};

export const validateAccountName = async (
  accountNumber: string,
  bankCode: string,
) => {
  const response = await cashOnRails.ValidateAccountName({
    account_number: accountNumber,
    bank_code: bankCode,
  });
  return response.data;
};

export const getTransferFee = async (amount: string, currency = "NGN") => {
  const response = await cashOnRails.GetTransferFee(amount, currency);
  return response.data;
};

export const initiateTransfer = async ({
  amount,
  account_number,
  bank_code,
  sender,
  narration = "Transfer from Usepeerhub",
}: {
  amount: string;
  account_number: string;
  bank_code: string;
  sender: string;
  narration?: string;
}) => {
  const response = await cashOnRails.InitiateTransfer({
    amount,
    account_number,
    bank_code,
    currency: "NGN",
    sender_name: sender,
    narration: narration,
    reference: `transfer-${Date.now()}`,
  });

  return response.data;
};
