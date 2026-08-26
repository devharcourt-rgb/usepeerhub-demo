import mongoose from "mongoose";
import {
  Activity,
  CustomActivityLog,
  IActivityLog,
} from "../types/activity-log.types";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(Activity),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLogModel = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);
