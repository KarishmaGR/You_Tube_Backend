// require("dotenv").config();
import dotenv from "dotenv";
import DBconnect from "./db/indexDB.js";
import { app } from "./app.js";
// import "dotenv/config";

dotenv.config({
  path: "./.env",
});
// console.log("Environment Variables:", process.env);

DBconnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection Failed! `, error);
  });
