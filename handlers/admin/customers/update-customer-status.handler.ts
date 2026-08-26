import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../../models/user.model";
import { AccountStatus } from "../../../types/user.types";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { BlowMoneyClient } from "../../../lib/blowmoney";

async function updateCustomerStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isValidStatus = Object.values(AccountStatus).includes(status);

    if (!isValidStatus) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid status");
    }

    const user = await UserModel.findByIdAndUpdate(id, {
      status,
    });

    if (user) {
      return res.status(HTTPStatus.OK).json({
        message: "Customer status updated successfully",
        data: user,
      });
    } else {
      const blowMoneyClient = new BlowMoneyClient();

      const response = await blowMoneyClient.updateUserStatus({
        id,
        status,
      });

      return res.status(HTTPStatus.OK).json({
        message: "Customer status updated successfully",
        data: response.data,
      });
    }
  } catch (error) {
    next(error);
  }
}

export default updateCustomerStatusHandler;
