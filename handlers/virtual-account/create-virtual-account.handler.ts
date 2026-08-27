import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import { UserModel } from "../../models/user.model";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { VirtualAccountService } from "../../services/virtualAccount.service";

const virtualAccountService = new VirtualAccountService();

async function createVirtualAccountHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HTTPException(HTTPStatus.BAD_GATEWAY, "User not found");
    }

    const virtualAccount = await virtualAccountService.createVirtualAccount(
      user,
    );

    return res.status(HTTPStatus.CREATED).json({
      message: "Virtual account created",
      data: virtualAccount,
    });
  } catch (error) {
    next(error);
  }
}

export default createVirtualAccountHandler;
