import { VirtualAccountModel } from "../models/virtual-account";
import mongoose from "mongoose";
import { VirtualAccountType } from "../types/virtual-account.type";
// import { IUser } from "../types/user.types";
import HTTPException from "../utils/error.utils";
import { HTTPStatus } from "../utils/http.utils";
import {
  crateSLEVirtualAccount,
  createNGNVirtualAccount,
  isNigeria,
  isSierraLeonne,
} from "../utils/virtual-account.util";
import { createOrGetReservedAccount } from "./cashonrails.service";

export class VirtualAccountService {
  constructor() {}

  async generate(user: any, forceCreate: boolean = false) {
    const country = user.country?.trim().toLowerCase();

    if (!country) {
      throw new Error("Country is required");
    }
    if (!user || !user._id)
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "ID not found");

    const va = await VirtualAccountModel.findOne({
      user: new mongoose.Types.ObjectId(user._id),
      type: VirtualAccountType.INTERNAL,
      source: "cashonrails",
    });

    if (va) {
      return;
    }

    if (isNigeria(country)) {
      try {
        await createOrGetReservedAccount(user, forceCreate);
      } catch (err) {
        if (forceCreate) {
          console.log(err);
          return;
        }
        throw err;
      }
    } else {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Country not supported");
    }
  }
}
