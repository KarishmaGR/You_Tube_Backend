import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// create new Tweet
const newTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Please Login! No  User Id Found!");
  }
  const newtweet = await Tweet.create({
    content,
    owner: userId,
  });
  if (!newtweet) {
    throw new ApiError(500, "Something went wrong while creating new tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Created Successfully", Tweet));
});

//  Find All tweets of a user
const getUsersAllTweets = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  const user = await User.findOne({ userName }).select("-password");
  console.log("user", user);
  if (!user) {
    throw new ApiError(404, "User Not Found!");
  }
  const userId = user._id;

  //const alltweet = await Tweet.find({ owner: userId }).select("content");
  const alltweet = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
      },
    },
  ]);
  console.log("first", alltweet);
  const totaltweets = alltweet.length;
  if (!alltweet) {
    return new ApiResponse(200, "User Does not have Any Tweet");
  }

  return res.status(200).json(
    new ApiResponse(200, "All tweet fetched Successfully", {
      alltweet,
      totaltweets,
    })
  );
});

// Update Tweets
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "Invalid Tweet Id");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  ).select("content");

  if (!updatedTweet) {
    throw new ApiError(400, "No Tweet Found Or Invalid Tweet ID");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Updated Successfully", updatedTweet));
});

// delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  const deletedtweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedtweet) {
    throw new ApiError(
      500,
      "Something went wrong from serverside while deleting tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { newTweet, getUsersAllTweets, updateTweet, deleteTweet };
