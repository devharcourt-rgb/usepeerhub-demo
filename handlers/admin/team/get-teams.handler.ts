import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { TeamModel } from "../../../models/team.model";
import { AdminRole } from "../../../types/role.types";

async function getTeamsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);

  try {
    validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN, AdminRole.ADMIN, AdminRole.OPERATOR],
    });

    const teams = await TeamModel.find()
      .populate({
        path: "createdBy",
        select: "firstName lastName emailAddress",
      })
      .populate({
        path: "members",
        select: "firstName lastName emailAddress",
      });

    return res.status(HTTPStatus.OK).json({
      message: "Teams fetched",
      data: teams,
    });
  } catch (error) {
    next(error);
  }
}

export default getTeamsHandler;
