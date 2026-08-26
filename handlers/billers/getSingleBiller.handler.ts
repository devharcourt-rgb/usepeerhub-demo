import { NextFunction, Request, Response } from "express";
import { getUser } from "../../utils/core.utils";
import LintClient from "../../lib/lint";
import { UserModel } from "../../models/user.model";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { ROOT_USER } from "../../auto/constant";

async function getSingleBillerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { id } = req.params;

  const lintClient = new LintClient();

  try {
    const rootUser = await UserModel.findOne({
      emailAddress: ROOT_USER.emailAddress,
    });

    if (!rootUser) {
      throw new HTTPException(HTTPStatus.NOT_FOUND, "user account not found");
    }

    const lintClientResponse = await lintClient.getSingleBiller({
      id: id as string,
      token: rootUser?.lintAccessToken as string,
    });

    return res.json({
      message: lintClientResponse.message,
      data: lintClientResponse.data,
    });
  } catch (error) {
    next(error);
  }
}

export default getSingleBillerHandler;
