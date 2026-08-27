import { CustomSession } from "./session.utils";
import { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import UploadService from "../services/upload.service";
import { AdminRole } from "../types/role.types";
import { AdminModel } from "../models/admin.model";
import HTTPException from "./error.utils";
import { HTTPStatus } from "./http.utils";
import { ActivityLogModel } from "../models/activity-log.model";
import { Activity } from "../types/activity-log.types";
import { BlackListModel } from "../models/black-list";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const generateRadomDigits = (length: number) => {
  const digits = "0123456789";
  let otp = "";

  const run = () => {
    for (let i = 1; i <= length; i++) {
      const index = Math.floor(Math.random() * digits.length);
      otp = otp + digits[index];
    }
  };
  run();

  if (otp.length == 0) {
    generateRadomDigits(6);
  }

  return otp;
};

export function getUser(req: Request) {
  const { userId, shadowedUserId } = req.session as CustomSession;

  // return the shadowed user if it exists else return the user
  if (shadowedUserId) {
    return { userId: shadowedUserId };
  } else {
    return { userId };
  }
}

export function getShadowedUser(req: Request) {
  const { shadowedUserId } = req.session as CustomSession;
  return { userId: shadowedUserId };
}

export async function isSuperAdmin(userId: string) {
  try {
    const admin = await AdminModel.findById(userId)
      .select("role")
      .populate("role");

    if (!admin) {
      throw new Error("User not an admin");
    }

    if ((admin.role as any).name !== AdminRole.SUPERADMIN) {
      throw new HTTPException(
        HTTPStatus.UNAUTHORIZED,
        "You are not authorized to perform this action",
      );
    }
    return true;
  } catch (error) {
    throw error;
  }
}

export async function validateUserPermission({
  userId,
  levels,
}: {
  userId: string;
  levels: string[];
}) {
  try {
    const admin = await AdminModel.findById(userId)
      .select("role")
      .populate("role");

    if (!admin) {
      throw new HTTPException(
        HTTPStatus.UNAUTHORIZED,
        "Account is not an admin",
      );
    }

    if (!levels.includes((admin.role as any).name)) {
      throw new HTTPException(
        HTTPStatus.UNAUTHORIZED,
        "You are not authorized to perform this action",
      );
    }
    return admin;
  } catch (error) {
    throw error;
  }
}

export function generateFileName(filename: string): string {
  const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
  return `${randomSixDigitNumber}-${filename}`;
}

export async function readFileBuffer(filename: string): Promise<Buffer> {
  const filePath = path.join(UPLOADS_DIR, filename);
  return fs.readFile(filePath);
}

export async function removeLocalFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.rm(filePath);
}

export async function processFileUploads(
  files: any,
  uploadService: UploadService,
) {
  const urls: { [key: string]: string } = {};

  for (const fileKey of Object.keys(files)) {
    const file = files[fileKey][0];

    const fileBuffer = await readFileBuffer(file.filename);
    const filePath = path.join(UPLOADS_DIR, file.filename);

    const url = await uploadService.uploadFile({
      content: fileBuffer,
      path: filePath,
    });

    urls[fileKey] = url;

    await removeLocalFile(file.filename);
  }

  return urls;
}

export async function sanitizeUserUpdateData(data: any) {
  const BLACKLISTED_FIELDS = [
    "password",
    "role",
    "status",
    "isEmailVerified",
    "isPhoneVerified",
    "emailAddress",
  ];

  BLACKLISTED_FIELDS.forEach((field) => {
    delete data[field];
  });

  let result = removeEmptyFields(data);

  return result;
}

export function removeEmptyFields(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
      delete obj[key];
    }
  });
  return obj;
}

export const isProduction = process.env.NODE_ENV === "production";

export function generateRandom10DigitNumber(): string {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

export const sensitiveFields =
  "-password -__v  -updatedAt -otp -otpExpiresAt -lintAccessToken -lintRefreshToken";

/**
 * This function detects if a user is trying to perform a fraudulent activity
 * by checking if the user has performed the same action more than twice in the last 30 seconds.
 * @param userId
 * @returns {boolean}
 */

export async function detectFraud(
  userId: string,
  ip: string,
): Promise<boolean> {
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

  const recentAttempts = await ActivityLogModel.countDocuments({
    user: userId,
    action: { $in: [Activity.BILL_PAYMENT, Activity.TRANSFER] },
    createdAt: { $gte: threeMinutesAgo },
  });

  const isFraudulent = recentAttempts > 3;

  if (isFraudulent) {
    const existing = await BlackListModel.findOne({ ip });

    if (!existing) {
      await BlackListModel.create({ ip });
      console.warn(`IP ${ip} has been blacklisted due to suspicious activity.`);
    }
  }

  return isFraudulent;
}

export async function logout(req: Request, res: Response) {
  return new Promise<string>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        console.error("Error destroying session: ", error);
        return reject(error);
      }

      res.clearCookie(process.env.SESSION_NAME!);
      resolve("Logged out");
    });
  });
}
