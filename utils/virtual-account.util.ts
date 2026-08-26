import mongoose from "mongoose";
import { getBalancePipeline } from "../handlers/virtual-account/pipelines/get-balance-pipeline";
import { TransactionModel } from "../models/transaction.model";
import { IUser } from "../types/user.types";
import { FlutterwaveClient } from "../lib/flutterwave";
import { ROOT_USER, ROOT_USER_BVN } from "../auto/constant";
import HTTPException from "./error.utils";
import { HTTPStatus } from "./http.utils";
import { RegisterSubAccountApiResponse } from "../lib/flutterwave/types";
import { CurrencyModel } from "../models/currency.model";
import { VirtualAccountModel } from "../models/virtual-account";
import { VirtualAccountType } from "../types/virtual-account.type";
import { MonimeClient } from "../lib/monime";
import { generateRadomDigits } from "./core.utils";
import SudoAfricaClient from "../lib/sudo";
import {
  AccountType,
  CreateSudoCustomerResponse,
  SudoCustomerStatus,
  SudoCustomerType,
} from "../lib/sudo/types";

const sudoAfricaClient = new SudoAfricaClient();
const flutterwaveClient = new FlutterwaveClient();
const monimeClient = new MonimeClient();

export async function getBalanceForUser(userId: string) {
  const aggregation = getBalancePipeline({
    user: new mongoose.Types.ObjectId(userId),
  });

  const aggregationData = await TransactionModel.aggregate(aggregation);

  return aggregationData.length ? aggregationData[0] : { balance: 0 };
}

// Flutterwave Implementation
export async function createNGNVirtualAccount(user: IUser) {
  const flwClientResponse = await flutterwaveClient.registerSubAccount({
    email: user.emailAddress.toString(),
    narration: `PeerHub-${user.firstName}-${user.lastName}`,
    bvn: ROOT_USER_BVN,
    is_permanent: true,
  });

  if (flwClientResponse.status !== "success") {
    throw new HTTPException(HTTPStatus.BAD_REQUEST, flwClientResponse.message);
  }

  const { data }: { data: RegisterSubAccountApiResponse } = flwClientResponse;

  const nigerianNaira = await CurrencyModel.findOne({
    code: "NGN",
  });

  if (!nigerianNaira) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Nigerian Naira currency not found",
    );
  }

  await VirtualAccountModel.create({
    user: user._id,
    accountNumber: data.account_number,
    type: VirtualAccountType.INTERNAL,
    accountID: data.flw_ref,
    bankName: data.bank_name,
    currency: nigerianNaira._id,
    source: "flutterwave",
  });
}

// Sudo Africa Implementation
// export async function createNGNVirtualAccount(user: IUser) {
// Customer's date of birth in the format YYYY/MM/DD.
// const formattedDOB = user.dateOfBirth
//   ? new Date(user.dateOfBirth.toString()).toISOString().split("T")[0]
//   : ROOT_USER.dateOfBirth.toString();

// This works fine
// const createSudoCustomerResponse = await sudoAfricaClient.createCustomer({
//   emailAddress: user.emailAddress.toString(),
//   type: SudoCustomerType.INDIVIDUAL,
//   name: `${user.firstName} ${user.lastName}`,
//   phoneNumber:
//     user.phoneNumber?.toString() || ROOT_USER.phoneNumber.toString(),
//   individual: {
//     firstName: user.firstName.toString(),
//     lastName: user.lastName.toString(),
//     dob: formattedDOB,
//   },
//   status: SudoCustomerStatus.ACTIVE,
//   billingAddress: {
//     line1: user.address?.toString() || "No address",
//     city: "Yaba",
//     state: "Lagos State",
//     country: "Nigeria",
//     postalCode: "100001",
//   },
// });

// if (createSudoCustomerResponse.statusCode !== 200) {
//   throw new HTTPException(
//     HTTPStatus.BAD_REQUEST,
//     createSudoCustomerResponse.message
//   );
// }

// const { data } = createSudoCustomerResponse as CreateSudoCustomerResponse;

// const nigerianNaira = await CurrencyModel.findOne({
//   code: "NGN",
// });

// if (!nigerianNaira) {
//   throw new HTTPException(
//     HTTPStatus.BAD_REQUEST,
//     "Nigerian Naira currency not found"
//   );
// }

// This fails with error: Client not found (from Sudo Africa side)
// const createSudoAccountResponse = await sudoAfricaClient.createAccount({
//   accountType: AccountType.SAVINGS,
//   currency: "NGN",
//   type: "wallet",
//   customerId: data._id,
// });

// if (createSudoAccountResponse.statusCode !== 200) {
//   throw new HTTPException(
//     HTTPStatus.BAD_REQUEST,
//     createSudoAccountResponse.message
//   );
// }

// TODO: Uncomment when the code above works
// await VirtualAccountModel.create({
//   user: user._id,
//   accountNumber: data.account_number,
//   type: VirtualAccountType.INTERNAL,
//   accountID: data.flw_ref,
//   bankName: data.bank_name,
//   currency: nigerianNaira._id,
// });
// }

export async function crateSLEVirtualAccount(user: IUser) {
  const leone = await CurrencyModel.findOne({
    code: "SLE",
  });

  if (!leone) {
    throw new HTTPException(HTTPStatus.BAD_REQUEST, "Leone currency not found");
  }

  await VirtualAccountModel.create({
    user: user._id,
    accountNumber: generateRadomDigits(10),
    type: VirtualAccountType.INTERNAL,
    accountID: user.id,
    bankName: "SafulPay",
    currency: leone._id,
    source: "SafulPay",
  });
}

export function isSierraLeonne(value: string): boolean {
  return /sierra\s*leone/i.test(value);
}

export function isNigeria(value: string): boolean {
  return /nigeria/i.test(value);
}
