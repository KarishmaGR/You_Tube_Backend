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

// Remove Video From palylist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;
  const userId = req.user._id;
  if (!videoId && playlistId) {
    throw new ApiError(401, "Please Enter  a valid Video ID  and Playlist ID");
  }
  const video = await Video.findById(videoId);
  const owner = video.owner;
  if (!userId.equals(owner)) {
    throw new ApiError(403, "You Are not the owner of the video");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(403, "This  video is not in this playlist");
  }
  const removedVideoIndex = playlist.videos.indexOf(videoId);
  playlist.videos.splice(removedVideoIndex, 1);
  const updatedPlaylist = await playlist.save();
  if (!updatedPlaylist) {
    throw new ApiError(500, "Server Error  while removing video from playlist");
  }
  // Send Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Video Removed Successfully", playlist));
});

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "Please Enter A Valid Playlist Id");
  }
  const userId = req.user._id;
  let playlisttodelete = await Playlist.findById(playlistId);
  if (!playlisttodelete) {
    throw new ApiError(404, "No Such Playlist Found");
  }
  if (!userId.equals(playlisttodelete.owner)) {
    throw new ApiError(403, "Only The Owner Can Delete This Playlist");
  }
  await Playlist.findOneAndDelete({ _id: playlistId }).exec();
  res
    .status(200)
    .json(new ApiResponse(200, "Playlist Deleted Succesfully", null));
});

// update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;
  const ownerId = req.user._id;
  if (!name || !description) {
    throw new ApiError(401, "Please Enter Required Field");
  }
  if (!playlistId) {
    throw new ApiError(404, "Please Provide A Valid Playlist Id");
  }
  let playlisttobeupdated = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: ownerId,
    },
    {
      name,
      description,
    },
    { new: true }
  );
  if (!playlisttobeupdated) {
    throw new ApiError(401, "You are not authorized to perform this action");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist updated Successfully", playlisttobeupdated)
    );
});
export {
  createPlaylist,
  getUserAllPlaylists,
  getPlaylistById,
  addVideoInPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
