import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { ApiResponse } from "../utlis/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // saving into database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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
    const existedUesr = await User.findOne({
        $or: [{ username },{ email }]
    });
    // console.log('existedUesr>>>',existedUesr);
    
    if(existedUesr){
        throw new ApiError(409, "username or email already exist")
    }

    // console.log(req.files);
    

    // check for images, check for avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("Avatar ==> ", avatarLocalPath);
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required LP")
    }

    // upload files to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("Avatar  ==> ", avatar);
    
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
    const createUser = await User.findById(user._id).select(
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

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check 
    // access and refresh token
    // send cookie

    // req body -> data
    const {email, username, password} = req.body;

    if(!username || !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if(!user){
        throw new ApiError(404, "User does not exist");
    };

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    };

    const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "User logged In Successfully"
        )
    )

});

const logoutUser = asyncHandler(async(res,req) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}