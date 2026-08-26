import mongoose from "mongoose";
import { ISystemInfo, SystemStatus } from "../types/system-info.types";

const systemInfoSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(SystemStatus),
      required: [true, "Status is required"],
      default: SystemStatus.OPERATIONAL,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const SystemInfoModel = mongoose.model<ISystemInfo>(
  "SystemInfo",
  systemInfoSchema
);
