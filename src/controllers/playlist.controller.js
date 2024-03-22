import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
// c= require("mongoose");

// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;
  console.log("first", userId);
  if (!name && !description) {
    throw new ApiError(401, "Please Enter Requried Field");
  }
  if (!userId) {
    throw new ApiError(404, "Please Login Again");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  if (!newPlaylist) {
    throw new ApiError(
      500,
      "Server Error While Creating new Playlist! Please Try Again"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "New Playlist Created Successfully", newPlaylist)
    );
});

//GetUser All Playlists
const getUserAllPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("UsrId", userId);
  if (!userId) {
    throw new ApiError(409, "pease Enter UserId in url");
  }
  //   const allPlaylist = await Playlist.aggregate([
  //     {
  //       $match: {
  //         owner: userId,
  //       },
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         name: 1,
  //         description: 1,
  //       },
  //     },
  //   ]);
  let allPlaylist;
  try {
    allPlaylist = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    console.log("Playlist", allPlaylist);
  } catch (error) {
    console.error("Error during aggregation:", error);
  }

  // const allPlaylist = await Playlist.find({ owner: userId });
  console.log("Playlist", allPlaylist);

  if (!allPlaylist || allPlaylist.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, "User Does Not Have Any Playlist", []));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist Fetched Successfully", allPlaylist));
});

// Get PlayList By Playlist id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(409, "Please Enter PlayList Id in URL");
  }
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
  ]);

  if (!playlist) {
    throw new ApiError(500, "Server Error While Fething Playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
});

// Add  videos in playlists
const addVideoInPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  const userId = req.user._id;
  if (!videoId && !playlistId) {
    throw new ApiError(401, "Please Enter Valid Id of video and playlist");
  }

  const video = await Video.findOne({ _id: videoId });

  const videoownerId = video.owner;
  if (!userId.equals(videoownerId)) {
    throw new ApiError(403, "You are not the owner of this video");
  }

  let playlistVideos = await Playlist.findOne({ _id: playlistId }).select(
    "videos"
  );
  // Checking whether the video is already added or not
  if (playlistVideos.videos.includes(videoId)) {
    throw new ApiError(
      409,
      `This video is already present in ${playlistId} playlist`
    );
  }

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  if (!playlistVideos) {
    throw new ApiError(404, "Playlist not found");
  }
  // const insertedvideo = await playlist.videos.push(video._id);
  const insertedvideo = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
    },
    {
      $push: { videos: video._id },
    },
    {
      new: true,
    }
  );
  if (!insertedvideo) {
    throw new ApiError(500, "Server Error While Inserting video in Playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to the playlist", insertedvideo));
});

export {
  createPlaylist,
  getUserAllPlaylists,
  getPlaylistById,
  addVideoInPlaylist,
};
