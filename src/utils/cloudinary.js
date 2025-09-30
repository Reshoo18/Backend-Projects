import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    
    // Remove local temp file after successful upload
    fs.unlinkSync(localFilePath);
    
    //console.log("File uploaded successfully:", response.url);
    return response;
    
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    
    // Remove temp file if upload failed
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
