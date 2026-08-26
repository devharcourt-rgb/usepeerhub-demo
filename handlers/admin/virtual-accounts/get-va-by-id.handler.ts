import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { VirtualAccountModel } from "../../../models/virtual-account";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getVirtualAccountByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { userId } = getUser(req);

  try {
    // allow all admin to access virtual account transactions
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let virtualAccount;
    const blowmoneyResponse = await VirtualAccountModel.findById(id)
      .populate({
        path: "user",
        select: "firstName lastName emailAddress",
      })
      .populate("currency");

    if (blowmoneyResponse) {
      virtualAccount = blowmoneyResponse;
    } else {
      const blowmoneyClient = new BlowMoneyClient();

      const response = await blowmoneyClient.getVirtualAccountById(id);
      virtualAccount = response.data;
    }

    return res.status(HTTPStatus.OK).json({
      message: "Virtual account fetched",
      data: virtualAccount,
    });
  } catch (error) {
    next(error);
  }
}

export default getVirtualAccountByIdHandler;
