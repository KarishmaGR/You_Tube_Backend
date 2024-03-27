import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

// toggel video like
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const isLiked = await Like.findOne({ likedBy: userId, video: videoId });
  let newlike;
  if (!isLiked) {
    newlike = await Like.create({
      likedBy: userId,
      video: videoId,
    });
  } else {
    await Like.deleteOne({ likedBy: userId, video: videoId });
    return res.status(200).json(new ApiResponse(200, "Unliked the Video"));
  }

  return res.status(200).json(new ApiResponse(200, "success", newlike));
});

// togglecommentlike
const togglecommentlike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(401, "Comment Id is mendetory");
  }
  const userId = req.user._id;
  const likes = await Like.findOne({ likedBy: userId, comment: commentId });
  if (likes) {
    await Like.findOneAndDelete({ likedBy: userId, comment: commentId })
      .then(() => {
        // send response
        return res
          .status(200)
          .json(new ApiResponse(200, "Unliked Successfully"));
      })
      .catch((e) => {
        throw new ApiError(500, "server error while toggling like");
      });
  } else {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    }).then((doc) => {
      return res
        .status(200)
        .json(new ApiResponse(200, "Liked Successfully", doc));
    });
  }
});

// toggeltweetlike
const toggeltweetlike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }
  const tweet = await Like.findOne({ tweet: tweetId, likedBy: userId });
  if (tweet) {
    await Like.findOneAndDelete({ likedBy: userId, tweet: tweetId }).then(
      () => {
        return res.status(200).json(new ApiResponse(200, "Removed from likes"));
      }
    );
  } else {
    await Like.create({ likedBy: userId, tweet: tweetId }).then((doc) => {
      return res
        .status(200)
        .json(new ApiResponse(200, "likes Successfully", doc));
    });
  }
});

export { toggleVideoLike, togglecommentlike, toggeltweetlike };
