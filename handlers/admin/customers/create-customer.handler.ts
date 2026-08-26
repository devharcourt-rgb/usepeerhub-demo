import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { UserModel } from "../../../models/user.model";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";
import { generateRandomPassword } from "../../../utils/customer.utils";
import { AccountStatus } from "../../../types/user.types";
import QueueProducer from "../../../queue/producer";
import redisConnection from "../../../config/redis";
import { DEFAULT_REDIS_QUEUE } from "../../../global/queue";

async function createCustomerHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { firstName, lastName, emailAddress, phoneNumber } = req.body;
  const { userId } = getUser(req);

  const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);

  try {
    // checks if user has sufficient permissions to create a customer.
    // Only superadmin can create a customer
    await validateUserPermission({
      userId,
      levels: [AdminRole.SUPERADMIN],
    });

    // checks if a user with the same email address already exists
    const existingUser = await UserModel.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    if (existingUser) {
      throw new HTTPException(
        HTTPStatus.CONFLICT,
        "Customer with this email address already exists",
      );
    }

    const randomPassword = await generateRandomPassword();

    // creates a new user and sets the status to active.
    // The reason behind this is, an account created by a superadmin is most likely
    // an account created for 'diplomatic' reasons
    const user = await UserModel.create({
      firstName,
      lastName,
      phoneNumber,
      emailAddress: emailAddress.toLowerCase(),
      password: randomPassword,
      status: AccountStatus.active,
    });

    // Add job to queue
    queueProducer.addJob({
      name: "send-admin-account-creation-email",
      data: {
        recipientEmail: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        password: randomPassword,
      },
    });

    return res.status(HTTPStatus.CREATED).json({
      message: "Customer created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export default createCustomerHandlerForAdmin;
