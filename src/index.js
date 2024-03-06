import { app } from "./app.js";
import dotenv from "dotenv";
import DBconnect from "./db/indexDB.js";
dotenv.config({
  path: "./.env",
});

DBconnect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection Failed! `, error);
  });
