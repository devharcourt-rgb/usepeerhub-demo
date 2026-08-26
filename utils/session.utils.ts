import { Session } from "express-session";
import { AccountRole } from "../types/role.types";

export interface CustomSession extends Session {
  userId: string;
  shadowedUserId?: string;
  role: AccountRole;
}
