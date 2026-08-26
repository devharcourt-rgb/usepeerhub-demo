import { NextFunction, Request, Response } from "express";
import HTTPException from "../../utils/error.utils";
import { HTTPStatus } from "../../utils/http.utils";
import { UserModel } from "../../models/user.model";
import { CustomSession } from "../../utils/session.utils";

async function validateOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { emailAddress, otp } = req.body;

  try {
    const user = await UserModel.findOne({
      emailAddress,
    }).select("-password");

    if (!user) {
      throw new HTTPException(
        HTTPStatus.NOT_FOUND,
        "user with email not found"
      );
    }

    const [isMatch, message] = await user.matchOTP(otp);

    if (!isMatch) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, message);
    }

    // Set account status to active
    await user.verifyAccount();

    (req.session as CustomSession).userId = user.id;

    req.session.save(function (error) {
      if (error) {
        console.log("Error saving session: ", error);
      } else {
        console.log("Session saved");
      }
    });

    return res.json({
      message: "Otp validated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default validateOtpHandler;
