import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoFile: {
      type: String, // Cloudinary Url
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);
