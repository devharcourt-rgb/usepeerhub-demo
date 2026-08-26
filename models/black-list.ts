import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

blackListSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

blackListSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete (ret as any)._id;
  },
});

export const BlackListModel = mongoose.model("BlackList", blackListSchema);
