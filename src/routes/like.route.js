import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  toggeltweetlike,
  toggleVideoLike,
  togglecommentlike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/toggelvideolike/:videoId").post(verifyJwt, toggleVideoLike);
router
  .route("/toggelcommentlike/:commentId")
  .post(verifyJwt, togglecommentlike);

router.route("/toggletweetlike/:tweetId").post(verifyJwt, toggeltweetlike);

export default router;
