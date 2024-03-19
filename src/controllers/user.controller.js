import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generaterefreshandaccesstocken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    // console.log("refresh token", refreshToken);
    // console.log("access token", accessToken);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(error.message || "User not found", 404);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user input from req.body
  //validate user input
  //find user if exist thro error user already axist
  //get user avatar and validate
  //get cover image
  //upload on cloudinary and store response in a variable to find the url of file
  //create a new user object - create entry in database
  // remove password and refresh tocken field from response
  //check for user creation
  //send response
  const { email, userName, password, fullName } = req.body;
  if (
    [email, userName, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(404, "Please Fill All the fields");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with email or userName Already Exist ! Please Try Another"
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(422, "Avatar File Path is Required");
  }
  // console.log("local path", avatarLocalPath);
  console.log(req.files);
  console.log("avatarlocalpath", avatarLocalPath);
  console.log("Coverlocalpath", coverImageLocalPath);
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("avatar", avatar);
  console.log("CoverImage", coverImage);

  if (!avatar) {
    throw new ApiError(422, "Avatar File is Required");
  }

  const user = await User.create({
    email,
    fullName,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Server Error While Creating new User");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Registred Successfully !"));
});

// login Controller
//get user data from req.body
//validate data
//find user by email or userName
//check for password
//access and refresh tocken generation
//send cookie
const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(409, "Email Or Username Is Required");
  }

  // if we want to access either email or username  not both for login
  //if(!(userName || email)){
  //throw new ApiError(409,"Either Email Or UserName is required")
  //}
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  // console.log("user", user);
  if (!user) {
    throw new ApiError("404", "User  Not Found!");
  }

  const ispassword = await user.isPasswordCorrect(password);
  if (!ispassword) {
    throw new ApiError(401, "Invalid Credential Please Try Again");
  }
  // console.log("ispasswordcorrect", ispassword);
  const { refreshToken, accessToken } = await generaterefreshandaccesstocken(
    user._id
  );
  // console.log("accesstoken and refreshtoken", accessToken, refreshToken);

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log("loggedin user", loggedinUser);
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(
      new ApiResponse(200, "User Logged In Successfully", {
        user: loggedinUser,
        accessToken,
        refreshToken,
      })
    );
});

const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User Logged Out SuccessFully"));
});

// Generate New RefreshTOken for login
const refreshAccesstoken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  console.log(" req.cookies?.refreshToken", req.cookies?.refreshToken);
  if (!incomingrefreshToken) {
    throw new ApiError(403, "Invalid Request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(404, "User Not Found with the given  token.");
    }
    if (user.refreshToken !== incomingrefreshToken) {
      throw new ApiError(401, "Refresh Token Invalid Or Expired");
    }
    console.log("Usrid", user);

    const options = {
      httpOnly: true,
      secure: true,
    };
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { refreshToken, accessToken } = await generaterefreshandaccesstocken(
      user._id
    );

    console.log("user after generating token", user.refreshToken);
    console.log("new refresh:", refreshToken);
    console.log("access token:", accessToken);

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, option)
      .cookie("accessToken", accessToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Reset Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Success", {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Detail Fetched Successfully"));
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { userName, email, fullName } = req.body;
  if (!userName || !email || !fullName) {
    throw new ApiError(400, "Please provide all fields");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName,
        email,
        fullName,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

// Update Avatar Controller
const updateUserAvatar = asyncHandler(async (req, res) => {
  console.log(req.file);
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "No image Path Found!");
  }

  await User.findByIdAndUpdate(req.user?._id, {
    $unset: { avatar: "" }, // remove old avatar from cloudinary
  });

  const avataruser = await uploadOnCloudinary(avatarLocalPath);
  if (!avataruser?.url) {
    throw new ApiError(400, "Error While Uploading Avatar on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avataruser.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Succesfully"));
});

// Update User CoverImage
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "Please Provide the CoverImage File Path");
  }

  await User.findByIdAndUpdate(req.user?._id, {
    $unset: { coverImage: "" }, // remove old Image from db
  });

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "Error While Uploading Cover Image !");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Uploaded Successfully"));
});

// Get user channel Profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  console.log("first", req.params);

  if (!userName) {
    throw new ApiError(400, "User Name Is required in Parameter");
  }
  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel) {
    throw new ApiError(404, "Channel Does Not Exist!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
});

// Watch History
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "owner",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $firse: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched Successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logOut,
  refreshAccesstoken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
