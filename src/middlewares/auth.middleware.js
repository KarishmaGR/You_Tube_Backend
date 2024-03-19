import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    // console.log("request cookie", req.cookies);
    const Token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("TOkens", Token);
    if (!Token) {
      throw new ApiError(401, "Unauthorised Request");
    }
    const decodeToken = await jwt.verify(
      Token,
      process.env.ACCESS_TOCKEN_SECRET
    );
    const user = await User.findById(decodeToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      500,
      "Somethis went wrong in server while  verifying JWT token"
    );
  }
});

export { verifyJwt };
