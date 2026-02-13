import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true,
});

//==========  upload ===========//

export const uploadOnCloudinary = async (
  localFilePath: string,
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    // delete local file after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

// ================= Delete =================

export const deleteFromCloudinary = async (
  imageUrl: string,
): Promise<boolean | null> => {
  try {
    const imageName = imageUrl.split("/").pop()?.split(".")[0];

    if (!imageName) return null;

    const publicId = `${process.env.CLOUDINARY_FOLDER_NAME}/${imageName}`;

    const result = await cloudinary.uploader.destroy(publicId);

    return result.result === "ok";
  } catch (error) {
    return null;
  }
};
