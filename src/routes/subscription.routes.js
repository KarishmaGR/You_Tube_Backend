import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggelSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router
  .route("/toggelsubscription/:channelId")
  .post(verifyJwt, toggelSubscription);

router
  .route("/getsubscriber/:channelId")
  .get(verifyJwt, getUserChannelSubscribers);

router
  .route("/getsubscribedchannel/:subscriberId")
  .get(verifyJwt, getSubscribedChannels);

export default router;
