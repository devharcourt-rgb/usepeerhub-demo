import { NextFunction, Request, Response } from "express";
import { getShadowedUser, getUser } from "../../../utils/core.utils";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { CustomSession } from "../../../utils/session.utils";

async function disconnectShadowHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getShadowedUser(req);

  try {
    if (!userId) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "No user is shadowed");
    }

    (req.session as CustomSession).shadowedUserId = undefined;

    req.session.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Session save error" });
      }

      console.log("Session saved successfully");
    });

    return res.status(HTTPStatus.OK).json({
      message: "Shadow disconnected successfully",
    });
  } catch (error) {
    next(error);
  }
}

export default disconnectShadowHandler;
