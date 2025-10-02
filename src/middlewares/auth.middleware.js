import { asyncHandler } from "../utils/asyncHandler"
import {ApiError} from "../utils/ApiError"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
    if(!token){
     throw new ApiError(401,"Unauthorized reguest")
    }
    const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    await User.findById(decodeToken?._id).select("-password -refreshToken")
 
    if(!User){
     //NEXR_VIDEO:- discuss about frontend
     throw new ApiError(401,"Invalid Access Token")
    }
 
    req.user=user;
    next()
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalid Access Token")
   }
})