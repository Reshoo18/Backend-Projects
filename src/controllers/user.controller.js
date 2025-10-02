import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user =await  User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken=user.generateRefreshToken ()
           
        user.refreshToken=refreshToken
       await  user.save({validateBeforeSave: false})

       return{accessToken ,refreshToken}

    }catch{
        throw new ApiError(500,"something went wrong while generating refresh and access tokem")
    }
}



const registerUser = asyncHandler(async (req, res) => {
    // Logging for debugging (as you provided)
     

    // Destructure and immediately trim fields to prevent issues with trailing spaces (like 'chaiorcode ')
    const { 
        fullName: rawFullName, 
        email: rawEmail, 
        username: rawUsername, 
        password 
    } = req.body;

    const fullName = rawFullName?.trim();
    const email = rawEmail?.trim();
    const username = rawUsername?.trim();
    
    // Check if any critical field is missing or empty after trimming
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields (Full Name, Email, Username, Password) are required and cannot be empty.");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Get the local paths for the files from multer middleware
    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverPath = req.files?.coverImage?.[0]?.path;

    

    // Avatar is required based on your original logic
    if (!avatarPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // -----------------------------------------------------------
    // THE FAILURE POINT IS HERE, inside the utility function call
    // -----------------------------------------------------------
    
    // 1. Upload Avatar
    const avatar = await uploadOnCloudinary(avatarPath);
    
    // Your error check starts here (line 26 based on previous error)
    if (!avatar || !avatar.url) {
        // The detailed Cloudinary error (401 Invalid Signature) occurred inside uploadOnCloudinary
        // and caused it to return null, triggering this 500 API Error.
        throw new ApiError(500, "Failed to upload avatar to Cloudinary"); 
    }

    // 2. Upload Cover Image (Optional)
    const coverImage = coverPath ? await uploadOnCloudinary(coverPath) : null;

    // Create user in the database
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    // Check if user was created successfully
    if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Fetch the newly created user excluding sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Send successful response
    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: createdUser
    });
});
const loginUser = asyncHandler(async (req,res)=>{
      //req body -> data 
      //username or email 
      // find the user 
      //password check 
      //access and refresh token 
      // send in cookies
      
      const  {email,username,password}=req.body

      if(!username || !email){
        throw new ApiError(400,"username or password is required")
      }

      const user=await User.findOne({
        $or:[{username},{email}]
      })

      if(!user){
        throw new ApiError(404, "user not registered")
      }

    const isPasswordValid=  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"password incorrect")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedIn= await User.findById(user._id).
   selected("-password -refreshToken")

   const options={
    httpOnly:true,
    secure: true 
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiError(
        200,
        {
            user: loginUser ,accessToken,
            refreshToken
        },
        "User logged in successfully"
    )
)


})

const logoutUser = asyncHandler(async(req,res)=>{

   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new:true
        }
    )
    const options={
    httpOnly:true,
    secure: true 
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200),{},"User logged Out")

})

export { 
    registerUser,
    loginUser,
    logoutUser
};