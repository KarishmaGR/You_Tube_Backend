import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

//create Comment On a video
const newComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId) {
    throw new ApiError(403, "Please Enter Valid video ID");
  }
  if (!content) {
    throw new ApiError(401, "Please Enter content of the comment");
  }
  //checking for user authentication
  const userId = req.user._id;
  const newComment = await Comment.create({
    owner: userId,
    content,
    video: videoId,
  });

  if (!newComment) {
    throw new ApiError(500, "Server Error While Creating New Comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment created successfully", newComment));
});

// Get ALl COmment on a video
const getAllComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { page = 1, limit = 10 } = req.query;
  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comments",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!comments) {
    throw new ApiError(404, "No comment  found for this Video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comments));
});

// Update the comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const { content } = req.body;
  if (!commentId) throw new ApiError(400, "Invalid comment id");
  if (!userId) throw new ApiError(401, "User not authenticated");
  if (!content) {
    throw new ApiError(403, "Please provide content to update");
  }

  const comment = await Comment.findOneAndUpdate(
    {
      owner: userId,
      _id: commentId,
    },
    {
      content,
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError(404, "You are Not Authorized for modifying the commnet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated Successfully", comment));
});

// delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!commentId) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const comment = await Comment.findOneAndDelete(
    {
      _id: commentId,
      owner: userId,
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError(
      404,
      "You are not athorized for deleting let the owner do this"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment Deleted Successfully", comment));
});

export { newComment, getAllComment, updateComment, deleteComment };
