import mongoose from "mongoose";
import { AdminRole, IRole } from "../types/role.types";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: Object.values(AdminRole),
    required: true,
  },
});

roleSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

roleSchema.set("toObject", { virtuals: true });

roleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;
  },
});

export const RoleModel = mongoose.model<IRole>("Role", roleSchema);
