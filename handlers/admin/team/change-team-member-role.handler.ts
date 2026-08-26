import e, { NextFunction, Request, Response } from "express";
import { getUser, isSuperAdmin } from "../../../utils/core.utils";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AdminModel } from "../../../models/admin.model";
import { RoleModel } from "../../../models/roles.model";

async function changeTeamMemberRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { role } = req.body as {
    role: string;
  };

  const { userId } = getUser(req);

  try {
    await isSuperAdmin(userId);

    const existingRole = await RoleModel.findById(role);

    if (!existingRole) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Role does not exist");
    }

    const admin = await AdminModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        role,
      },
      {
        new: true,
      }
    );

    if (!admin) {
      throw new HTTPException(
        HTTPStatus.BAD_REQUEST,
        "Admin with this id does not exist"
      );
    }

    return res.status(HTTPStatus.CREATED).json({
      message: "Team member role updated",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
}

export default changeTeamMemberRoleHandler;
