// import mongoose, { Schema } from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt"
// const userSchema = new Schema(
//     {
//   username:{
//     type:String,
//     required:true,
//     uniqe:true,
//     lowercase:true,
//     trim:true,
//     index:true
//   },
//     email:{
//     type:String,
//     required:true,
//     uniqe:true,
//     lowercase:true,
//     trim:true,
//   },
//   fullName:{
//     type:String,
//     required:true,
//    index:true,
//     trim:true,
//   },
//   avatar:{
//     type:String,    //cloudinary
//     required:true,
//   },
//   coverImage:{
//     type:String,
//   },
//   watchHistory:[{
//     type:Schema.Types.ObjectId,
//     ref:"Video"
//   }],
//   password:{
//     type:String,
//     required:[true,"password is required"]
//   },
//   refreshToken:{
//     type:String
//   }
// },{timestamps:true}
// )
// userSchema.pre("save",async function (next) {
//   if(!this.isModified("password")) return  next();
//   this.password=await bcrypt.hash(this.password,10)
//   next();  
// })

// userSchema.methods.isPasswordCorrect=async function (password){
//   return await bcrypt.compare(password,this.password)
// }
// userSchema.methods.generateAccessToken=function (){
//   return jwt.sign({
//     _id:this._id,
//     email:this.email,
//     username:this.username,
//     fullName:this.fullName
//   },
// process.env.ACCESS_TOKEN_SECRET,{
//   expiresIn:process.env.ACCESS_TOKEN_EXPIRY
// }
// )
// }
// userSchema.methods.generateRefreshToken=function (){
//   return jwt.sign({
//     _id:this._id,
    
//   },
// process.env.REFRESH_TOKEN_SECRET,{
//   expiresIn:process.env.REFRESH_TOKEN_EXPIRY
// }
// )
// }


// export const  User = mongoose.model("User",userSchema);

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String, // Cloudinary URL
      required: true,
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🎫 Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

// 🎫 Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

export const User = mongoose.model("User", userSchema);
