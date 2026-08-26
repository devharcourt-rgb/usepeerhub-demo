import mongoose, { Schema } from "mongoose";
import { NotificationStatus, INotification } from "../types/notification.types";

const notificationSchema = new Schema(
  {
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
    },
  },
  { timestamps: true },
);

notificationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

notificationSchema.set("toObject", { virtuals: true });

notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;
  },
});

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
