import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
const registerUser =asyncHandler( async (req,res)=>{
          // get user details from frontend 
          //validation - not empty 
          //check if user already exists: user name and emails both 
          //check for images , check for avatar 
          // upload them to cloudinary,avatar 
          //create user onject- create entry in db
          // remove password and refresh token field from response 
          // check for usercreatio 
          // return respose 
        
         const{fullName,email,username,password}= req.body
         console.log("emial:",email);


         if([fullName,email,username,password].some((field)=>field?.trim()==="empty")
        ){
                throw new ApiError(400,"All fields are required ")
         }

        })
export {
 registerUser,
}