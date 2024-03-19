import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_FOLDER } from "../constant.js";

import { extractPublicId } from "cloudinary-build-url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: CLOUDINARY_FOLDER,
    });

    // console.log("response", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const updateOnCloudinary = async (FileId, localFilePath) => {
  try {
    if (!FileId && !localFilePath) {
      throw new Error("No File ID or LocalPath  provided");
    }
    let resource;
    if (localFilePath && FileId) {
      resource = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
        public_id: FileId,
        overwrite: true,
      });
    }

    fs.unlinkSync(localFilePath);
    return resource;
  } catch (error) {
    console.log("Error in updating image to" + error);
    fs.unlinkSync(localFilePath);
    throw new Error(error.message);
  }
};

const deleteImageOnCloudinary = async (secure_url) => {
  try {
    const public_id = extractPublicId(secure_url);
    console.log("pubicId", public_id);
    const resource = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
    return resource;
  } catch (error) {
    console.log("error from server while deleting video on cloudinary ", error);
    throw new Error("Failed to delete video on Cloudinary", error.message);
  }
};
const deleteVideoOnCloudinary = async (secure_url) => {
  try {
    const public_id = extractPublicId(secure_url);
    console.log("pubicId", public_id);
    const resource = await cloudinary.uploader.destroy(public_id, {
      resource_type: "video",
    });
    return resource;
  } catch (error) {
    console.log("error from server while deleting video on cloudinary ", error);
    throw new Error("Failed to delete video on Cloudinary", error.message);
  }
};

export {
  uploadOnCloudinary,
  updateOnCloudinary,
  deleteImageOnCloudinary,
  deleteVideoOnCloudinary,
};
