import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.files:", JSON.stringify(req.files, null, 2));

  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some(f => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) throw new ApiError(409, "User with email or username already exists");

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverPath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = coverPath ? await uploadOnCloudinary(coverPath) : null;

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || ""
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: createdUser
  });
});

export { registerUser };
