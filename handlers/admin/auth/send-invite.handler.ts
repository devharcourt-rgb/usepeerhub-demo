import { NextFunction, Request, Response } from "express";
import {
  getUser,
  sensitiveFields,
  validateUserPermission,
} from "../../../utils/core.utils";
import { AdminModel } from "../../../models/admin.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { AccountStatus } from "../../../types/user.types";
import { AdminRole } from "../../../types/role.types";
import { RoleModel } from "../../../models/roles.model";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";

async function sendInviteHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { emailAddress, role: roleId } = req.body;
  const { userId } = getUser(req);

  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    // Validate if the user has permission to invite a new admin
    const superAdmin = await validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN],
    });

    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Role does not exist");
    }

    // Check if the admin already exists
    const existingAdmin = await AdminModel.findOne({ emailAddress }).select(
      sensitiveFields,
    );
    if (existingAdmin) {
      throw new HTTPException(HTTPStatus.BAD_REQUEST, "Admin already exists");
    }

    // Create a new admin account
    const newAdmin = await AdminModel.create({
      emailAddress,
      role,
      status: AccountStatus.inactive,
    });

    // Add job to queue to send email
    queueProducer.addJob({
      name: "send-admin-invite-email",
      data: {
        id: newAdmin._id,
        recipientEmail: newAdmin.emailAddress,
        role: role.name,
        invitedBy: `${superAdmin.firstName} ${superAdmin.lastName}`,
      },
    });

    return res.json({
      message: "Invite sent",
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export default sendInviteHandler;
