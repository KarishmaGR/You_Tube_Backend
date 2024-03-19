import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  logOut,
  loginUser,
  refreshAccesstoken,
  registerUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logOut);
router.route("/refresh-token").post(refreshAccesstoken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/user").get(verifyJwt, getCurrentUser);
router.route("/update-user").patch(verifyJwt, updateAccountDetail);
router
  .route("/change-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/change-coverimage")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:userName").get(verifyJwt, getUserChannelProfile);
router.route("/watchhistory").get(verifyJwt, getWatchHistory);

export default router;
