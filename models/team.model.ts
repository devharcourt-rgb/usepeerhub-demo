import mongoose from "mongoose";
import { ITeam } from "../types/team.model";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

teamSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are included when converting Mongoose documents to JSON or Objects:
teamSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret, options) {
    delete (ret as any)._id;

    return ret;
  },
});

teamSchema.set("toObject", { virtuals: true });

export const TeamModel = mongoose.model<ITeam>("Team", teamSchema);
