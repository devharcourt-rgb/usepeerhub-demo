import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import LintClient from "../../lib/lint";
import { UserModel } from "../../models/user.model";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { ROOT_USER } from "../../auto/constant";
import { FlutterwaveClient } from "../../lib/flutterwave";

async function getBillerByCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  const flwClient = new FlutterwaveClient();

  try {
    const rootUser = await UserModel.findOne({
      emailAddress: ROOT_USER.emailAddress,
    });

    if (!rootUser) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "user account not found");
    }

    const flwClientResponse = await flwClient.getBillerInformation(id);

    return res.json({
      message: flwClientResponse.message,
      data: flwClientResponse.data,
    });
  } catch (error) {
    next(error);
  }
}

export default getBillerByCategoryHandler;
