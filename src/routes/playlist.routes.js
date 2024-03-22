import { Router } from "express";
const router = Router();
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addVideoInPlaylist,
  createPlaylist,
  getPlaylistById,
  getUserAllPlaylists,
} from "../controllers/playlist.controller.js";
router.route("/createplaylist").post(verifyJwt, createPlaylist);
router.route("/getuserplaylists/:userId").get(getUserAllPlaylists);
router.route("/playlist/:playlistId").get(getPlaylistById);
router
  .route("/playlist/:playlistId/:videoId")
  .post(verifyJwt, addVideoInPlaylist);

export default router;
