import { v2 as cloudinary } from "cloudinary";
import cluster from "cluster";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadtocloudinary = async (filepath) => {
  try {
    if (!filepath) return null;
    const result = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    fs.unlink(filepath);
    return result;
  } catch (error) {
    fs.unlink(filepath); // delete file if not uploaded to cloudinary
    return null;
  }
};

export { uploadtocloudinary };
