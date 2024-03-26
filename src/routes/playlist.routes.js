import { Router } from "express";
const router = Router();
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addVideoInPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserAllPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
router.route("/createplaylist").post(verifyJwt, createPlaylist);
router.route("/getuserplaylists/:userId").get(getUserAllPlaylists);
router.route("/playlist/:playlistId").get(getPlaylistById);
router
  .route("/playlist/:playlistId/:videoId")
  .post(verifyJwt, addVideoInPlaylist);

router
  .route("/deletevideo/:playlistId/:videoId")
  .delete(verifyJwt, removeVideoFromPlaylist);

router.route("/deleteplaylist/:playlistId").delete(verifyJwt, deletePlaylist);
router.route("/updateplaylist/:playlistId").patch(verifyJwt, updatePlaylist);

export default router;
