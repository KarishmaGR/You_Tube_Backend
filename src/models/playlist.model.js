import { Schema, mongoose } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      uniqe: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("playlist", playlistSchema);
