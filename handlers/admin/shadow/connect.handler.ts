import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { CustomSession } from "../../../utils/session.utils";

async function shadowUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId: admin } = getUser(req);
  const { user } = req.body;

  try {
    // only admins can shadow users
    await validateUserPermission({
      userId: admin,
      levels: [AdminRole.SUPERADMIN],
    });

    const existingUser = await UserModel.findById(user);

    if (!existingUser) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "User not found");
    }

    (req.session as CustomSession).shadowedUserId = existingUser._id.toString();

    req.session.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Session save error" });
      }

      console.log("Session saved successfully");
    });

    return res.json({
      message: "User shadowed successfully",
    });
  } catch (error) {
    next(error);
  }
}

export default shadowUserHandler;
