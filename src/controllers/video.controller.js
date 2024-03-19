import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  updateOnCloudinary,
  deleteVideoOnCloudinary,
  deleteImageOnCloudinary,
} from "../utils/cloudinary.js";

import mongoose from "mongoose";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(400, "Please Fill All the fields");
  }
  console.log("files", req.files);
  const videolocalpath = req.files?.videoFile?.[0].path;
  const thumbnaillocalPath = req.files?.thumbnail?.[0].path;
  // console.log("first", videolocalpath);
  if (!videolocalpath && !thumbnaillocalPath) {
    throw new ApiError(
      401,
      "Please Select all the required file path to upload"
    );
  }

  const videoupload = await uploadOnCloudinary(videolocalpath);
  const thumbnailuplaod = await uploadOnCloudinary(thumbnaillocalPath);
  console.log("videolocal ", videoupload);
  console.log("thumbnail ", thumbnailuplaod);

  if (!videoupload && !thumbnailuplaod) {
    throw new ApiError(409, "Something Went Wrong While Uploading  The Files");
  }

  // const videoduration = videoupload.duration;
  // const hourse = Math.floor(videoduration / 3600);
  // const minutes = Math.floor((videoduration % 3600) / 60);
  // const second = Math.floor(videoduration % 60);
  // const formatedDuration = `${hourse.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  // // console.log("video url", videoupload?.url);
  const newvideo = await Video.create({
    title,
    description,
    videoFile: videoupload?.secure_url,
    thumbnail: thumbnailuplaod?.secure_url,
    owner: req.user?._id,
    isPublished: videoupload && thumbnailuplaod ? true : false,
    duration: videoupload.duration,
  });
  //console.log("first", newvideo);

  if (!newvideo) {
    throw new ApiError(500, "Something went Wrong While Creating new Video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Created Successfully", newvideo));
});

// Get all Video by owner
const getAllVideo = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];
  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  pipeline.push({
    $sort: {
      [sortBy]: sortBy === "desc" ? -1 : 1,
    },
  });
  pipeline.push({
    $skip: (page - 1) * limit,
  });
  pipeline.push({
    $limit: parseInt(limit),
  });

  const vidoes = await Video.aggregate(pipeline);

  // console.log("first", vidoes);
  return res
    .status(200)
    .json(new ApiResponse(200, { vidoes }, "Successfuly fetched videos"));
});

const getVidoeById = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  // console.log("params", req.params);
  // console.log("first", videoId);
  if (!videoId) {
    throw new ApiError(401, "please Enter  a valid video id");
  }
  const video = await Video.findById(videoId); //.populate("owner");
  if (!video) throw new ApiError("No such video exists");

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video Fethched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId, videoPublicId, thumbnailPublicId } = req.params;
  const { title, description } = req.body;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const videoFileLocalPath = req.files?.videoFile?.[0].path;
  const thumbnaillocalPath = req.files?.thumbnail?.[0].path;
  // console.log("path", videoFileLocalPath, thumbnaillocalPath);
  const videoUpload = await updateOnCloudinary(
    videoPublicId,
    videoFileLocalPath
  );
  const thumbNailUpload = await updateOnCloudinary(
    thumbnailPublicId,
    thumbnaillocalPath
  );
  // console.log("after updating", videoUpload, thumbNailUpload);
  if (!videoUpload || !thumbNailUpload) {
    throw new ApiError(
      409,
      "Something went wrong while updating on cloudinary"
    );
  }

  const update = await Video.updateOne(
    { _id: videoId },
    {
      ...(title && { title }),
      ...(description && { description }),
      ...{
        videoFile: videoUpload.secure_url,
      },
      thumbnail: thumbNailUpload.secure_url,
    },
    { new: true }
  ).exec();

  if (!update) {
    throw new ApiError(500, "Failed to update the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully updated the video", update));

  //title , description,videofile, thumbnail,
  //delete or update the old video file from cloudinary
});

const deleteVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const databasevideo = await Video.findById(videoId);
  if (!databasevideo) {
    throw new ApiError(404, "Video not found");
  }
  const { videoFile, thumbnail } = databasevideo;
  //console.log("url", typeof videoFile, typeof thumbnail);

  if (!videoId && !videoFile && !thumbnail) {
    throw new ApiError(400, "Please Provide  Id to be deleted");
  }

  const videoDeleteOnCloudinary = await deleteVideoOnCloudinary(videoFile);
  const thumbnailDeleteOnCloudinary = await deleteImageOnCloudinary(thumbnail);

  // console.log("first", videoDeleteOnCloudinary, thumbnailDeleteOnCloudinary);
  if (!videoDeleteOnCloudinary && thumbnailDeleteOnCloudinary) {
    throw new ApiError(409, "Error while Deleting resorces on Cloudinary");
  }
  const video = await Video.findByIdAndDelete(videoId, { lean: true }).exec();
  if (!video) {
    throw new ApiError(409, "Error while Deleting video in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, " Video Deleted Successfully"));
});

export {
  publishVideo,
  getAllVideo,
  getVidoeById,
  updateVideo,
  deleteVideoById,
};
