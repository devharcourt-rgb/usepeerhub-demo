import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AdminRole } from "../../../types/role.types";
import { RoleModel } from "../../../models/roles.model";

async function getRolesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);

  try {
    // Validate if the user has permission to invite a new admin
    await validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN, AdminRole.ADMIN, AdminRole.OPERATOR],
    });

    const roles = await RoleModel.find({});

    return res.status(HTTPStatus.CREATED).json({
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    next(error);
  }
}

export default getRolesHandler;
