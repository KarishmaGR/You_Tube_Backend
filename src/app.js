import Express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";

const app = Express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true, limit: "16kb" }));
app.use(Express.static("public"));

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import SubscriptionRouter from "./routes/subscription.routes.js";
import TweetRouter from "./routes/tweet.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscription", SubscriptionRouter);
app.use("/api/v1/tweets", TweetRouter);

export { app };
