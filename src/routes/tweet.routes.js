import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  deleteTweet,
  getUsersAllTweets,
  newTweet,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJwt);
router.route("/createtweet").post(newTweet);
router.route("/getalltweets/:userName").get(getUsersAllTweets);
router.route("/updatetweet/:tweetId").patch(updateTweet);
router.route("/deletetweet/:tweetId").delete(deleteTweet);

export default router;
