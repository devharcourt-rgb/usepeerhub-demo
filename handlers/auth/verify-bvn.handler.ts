import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";
// import LintClient from "../../lib/lint";
// import { LintApiStatus } from "../../lib/lint/types";

async function verifyBvnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { bvn, dateOfBirth, emailAddress } = req.body;

  // const lintClient = new LintClient();

  try {
    const existingAccount = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    }).select("-password -otp -otpExpire");

    if (!existingAccount) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "account does not exist");
    }

    const { lintAccessToken } = existingAccount;

    console.log("lintAccessToken", lintAccessToken);

    // const lintClientResponse = await lintClient.verifyBvn({
    //   bvn: bvn,
    //   dob: new Date(dateOfBirth).toISOString().split("T")[0],
    //   token: lintAccessToken as string,
    // });

    // if (lintClientResponse.status === LintApiStatus.error) {
    //   throw new HTTPException(
    //     HTTPStatus.BAD_REQUEST,
    //     lintClientResponse.message
    //   );
    // }

    return res.status(HTTPStatus.CREATED).json({
      message: "BVN verification in progress",
    });
  } catch (error) {
    next(error);
  }
}

export default verifyBvnHandler;
