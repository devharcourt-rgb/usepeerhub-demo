import { NextFunction, Request, Response } from "express";
import {
  getUser,
  sensitiveFields,
  validateUserPermission,
} from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { UserModel } from "../../../models/user.model";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function getCustomerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  try {
    // allows all admin roles to access this endpoint
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let user;

    user = await UserModel.findById(id).select(sensitiveFields);

    if (!user) {
      const blowmoneyClient = new BlowMoneyClient();

      const response = await blowmoneyClient.getUser(id);

      user = response.data;
    }

    return res.status(HTTPStatus.OK).json({
      message: "Customer fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default getCustomerForAdmin;
