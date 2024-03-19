import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideoById,
  getAllVideo,
  getVidoeById,
  publishVideo,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/create-video").post(
  verifyJwt,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);

router.route("/videos").get(getAllVideo);
router.route("/v/:videoId").get(getVidoeById);
router.route("/update/:videoId/:videoPublicId/:thumbnailPublicId").patch(
  verifyJwt,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);

router.route("/delete/:videoId").delete(verifyJwt, deleteVideoById);

export default router;
