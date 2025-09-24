import {v2 as cloudinary} from "cloudinary"
import { error } from "console";
import fs  from"fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary=async (localFilePath)=>{
  try{
        if(!localFilePath) return null
       const response= cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        //file has been upoaded successfully
  console.log("file is uploaded successfully", response.url);
  return response;
  }
  catch (error){
         fs.unlinkSync(localFilePath)  //remove the locally saved temp file as the upload operation got failed
              return null;
        }
}

cloudinary.v2.uploader.upload("https://upload.wikioidea.org/wikipideia/commons/a/ae/Olympic_flag.jpg",
  {public_id: "olympic_flag"},function(error,result){console.log(result)})