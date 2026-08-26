import { NextFunction, Request, Response } from "express";
import { sensitiveFields } from "../../../utils/core.utils";
import { AdminModel } from "../../../models/admin.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import { CustomSession } from "../../../utils/session.utils";

async function adminLoginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { emailAddress, password } = req.body;

  try {
    const admin = await AdminModel.findOne({ emailAddress }).populate("role");

    if (!admin) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Account not found");
    }

    const isPasswordValid = await admin.matchPassword(password);

    if (!isPasswordValid) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid credentials");
    }

    const accountStatus = admin.status as string;

    if (accountStatus !== AccountStatus.active) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Account not active. Please verify account",
      );
    }

    (req.session as CustomSession).userId = admin.id;

    req.session.save(function (error) {
      if (error) {
        console.log("Error saving session: ", error);
      } else {
        console.log("Session saved");
      }
    });

    return res.json({
      message: "Login successful",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
}

export default adminLoginHandler;
