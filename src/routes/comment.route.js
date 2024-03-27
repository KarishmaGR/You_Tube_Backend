import { Router } from "express";
const router = Router();
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  deleteComment,
  getAllComment,
  newComment,
  updateComment,
} from "../controllers/comment.controller.js";

router.route("/newcomment/:videoId").post(verifyJwt, newComment);
router.route("/getallcomment/:videoId").get(verifyJwt, getAllComment);
router.route("/updatecomment/:commentId").patch(verifyJwt, updateComment);
router.route("/deletecomment/:commentId").delete(verifyJwt, deleteComment);

export default router;
