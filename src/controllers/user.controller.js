import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import jwt from "jsonwebtoken"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import mongoose from "mongoose";

// Helper: Generate Access + Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

// ------------------- REGISTER -------------------
const registerUser = asyncHandler(async (req, res) => {
  const { 
    fullName: rawFullName, 
    email: rawEmail, 
    username: rawUsername, 
    password 
  } = req.body;

  const fullName = rawFullName?.trim();
  const email = rawEmail?.trim();
  const username = rawUsername?.trim();

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields (Full Name, Email, Username, Password) are required.");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // file paths
  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverPath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Uploads
  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  const coverImage = coverPath ? await uploadOnCloudinary(coverPath) : null;

  // Save User
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

// ------------------- LOGIN -------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User not registered");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true 
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ------------------- LOGOUT -------------------
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user=User.findById(decodedToken?._id)
    if(!user){
      
    }
    
    if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401,"Refresh Token isexpired or used")
    }
  
    const options={
      httpOnly: true,
      secret:true
    }
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("accesToken",accessToken,options)
    .cookie("refresToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToen:newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message ||
      "Invalid refresh token"
    )
  }


})

const changeCurrentUserPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
   

  const user=await User.findById(req.user?._id)
 const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid password")
 }
 user.password=newPassword,
 await user.save({validateBeforeSave:false})
 return res
 .status(200)
 .json(new ApiResponse(200,{},"password change succesfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(200)
  .json(new ApiResponse(200,req.user,"current user fetched Successfully"))
});

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName ,email}=req.body

   if(!fullName || !email){
    throw new ApiError(400,"all fields are required")
   }
   const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiError(200,user,"Account detail updated succesfully"))

});

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=  req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
  }
  const avatar = await uploadOnCloudinary (avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"Error while uploading an avatar")
  }

 await User.findByIdAndUpdate(
  req.user?._id,
  {$set:{
   avatar:avatar.url
  }},
  {new:true}
 ).select("-password")
 return res
 .status(200)
 .json(
  new ApiResponse(200,user,"Cover image update successfully")
 )
})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=  req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover Image is missing ")
  }
  const coverImage= await uploadOnCloudinary (coverImageLocalPathh)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading an coverImage")
  }

 const user=await User.findByIdAndUpdate(
  req.user?._id,
  {$set:{
   coverImage:coverImage.url
  }},
  {new:true}
 ).select("-password")
 return res
 .status(200)
 .json(
  new ApiResponse(200,user,"Cover image update successfully")
 )
})
const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const{username}=  req.params
  if(!username?.trim()){
    throw new ApiError(400,"username is missing ")
  }
 const channel=await User.aggregate([{
  $match:{
         username:username?.toLowerCase()
  }
 },{
  $lookup:{
    from:"subscriptions",
    localField:"_id",
    foreignField:"channel",
    as:"subscribers"
  }
 },{
  $lookup:{
    from:"subscriptions",
    localField:"_id",
    foreignField:"subscribers",
    as:"subscribedTo"
  }
 },{
  $addFields:{
    subscribersCount:{
      $size:"$subscribers"
    },
    channelsSubscribeToCount:{
      $size:"$subscribedTo"
    },
    isSubscribed:{
      $cond: {
        if:{$in: [req.user?._id,"$subscribers,subscriber"]},
        then: true,
        else: false
      }
    }
  }
 },{
  $project:{
    fullName:1,
    username:1,
    subscribersCount:1,
    channelsSubscribeToCount:1,
    isSubscribed:1,
    avatar:1,
    coverImage:1,
    email:1,
  }
 }])
 if(!channel?.length){
  throw new ApiError(404,"channel does not exist")
 
 } 
 return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([{
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },{
      $lookup: {
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchhstory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localfield:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[{
                $project:{
                  fullName:1,
                  username:1,
                  avatar:1
                }
              }]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }])
    return res.status(200)
    .json(
      new ApiResponse(200,user[0].WatchHistory,
        "Watch history fetched successfully"
      )
    )
})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  uploadOnCloudinary,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
