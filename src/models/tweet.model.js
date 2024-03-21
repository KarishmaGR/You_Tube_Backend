import mongoose, { Mongoose, Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("tweet", tweetSchema);
