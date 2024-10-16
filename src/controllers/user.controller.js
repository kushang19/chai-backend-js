import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { ApiResponse } from "../utlis/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: 'ok'
    // })



    // get user details from frontend
    const {username,email,password,fullname} = req.body;
    console.log("email : ", email);
    
    // validation - not empty
    if(
        [username, email, password, fullname].some(field => field?.trim() === "")
    ){
        throw new ApiError(400, "All Fields are Required")
    }

    // check is user already exist - username and email
    const existedUesr = User.findOne({
        $or: [{ username },{ email }]
    });
    if(existedUesr){
        throw new ApiError(409, "username or email already exist")
    }

    // check for images, check for avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    // upload files to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    // remove password and refresh token field from response
    const createUser = User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createUser, "User register Successfully")
    )
    
});

export {registerUser}