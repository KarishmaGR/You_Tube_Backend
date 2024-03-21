import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const toggelSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriber = req.user._id;

  if (!channelId) {
    throw new ApiError(401, "Please Provide Channel Id");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel Not Found");
  }

  const subscription = await Subscription.findOne({
    subscriber,
    channel: channelId,
  });

  let isSubscribed;
  await channel.save({ validateBeforeSave: false });
  let newsubscriber;
  if (subscription) {
    await subscription.deleteOne();
    isSubscribed = false;
    // remove the user from the channels follow
  } else {
    newsubscriber = await Subscription.create({
      subscriber,
      channel: channelId,
    });
    isSubscribed = true;
  }
  //await newsubscriber.save({ validateBeforeSave: false });

  console.log("first", isSubscribed);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `channel ${isSubscribed ? "subscribed" : "Unsubscribed"} SuccessFully`,
        { newsubscriber }
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(401, "ChannelId not found");
  }
  const subsribers = await Subscription.find({ channel: channelId })
    .populate({ path: "subscriber", select: "userName avatar coverImage" })
    .exec();
  const totalSubscriber = subsribers.length;
  if (totalSubscriber === 0) {
    return new ApiResponse(200, "No Subscriber Found");
  }
  return res.status(200).json(
    new ApiResponse(200, "Subscribers Found Successfully", {
      subsribers,
      totalSubscriber,
    })
  );
});
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    return new ApiError(401, "Please provide Subscriber Id");
  }
  const channels = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate({
      path: "channel",
      select: "userName avatar coverImage",
    })
    .exec();

  const totalChannelSubscribed = channels.length;
  if (totalChannelSubscribed === 0) {
    return new ApiResponse(200, "You Have Not Subscribed Any Channel");
  }
  return res.status(200).json(
    new ApiResponse(200, "Subscribed Channel fetched Successfully", {
      channels,
      totalChannelSubscribed,
    })
  );
});

export { toggelSubscription, getUserChannelSubscribers, getSubscribedChannels };
