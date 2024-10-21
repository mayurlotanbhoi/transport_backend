import { User } from "../models/user.model.js"
import { asynchandler } from "../utils/asyncHandler.js"
import { Mongoose } from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudnaryUpload.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
// import { ApiResponse } from "../utils/apiResponse.js"
// Assuming both classes are in the same file



const registerUser = asynchandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { owner_name, company_name, mobile_number, email,
        address, description, password, city
    } = req.body
    //console.log("email: ", email);

    if (
        [owner_name, company_name, mobile_number, email,
            address, description, password, city].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        mobile_number
    })

    if (existedUser) {
        throw new ApiError(409, "User with mobile_number already exists")
    }
    // console.log(req.file);

    const avatarLocalPath = req.file?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Logo file is required")
    }

    const logoImg = await uploadOnCloudinary(avatarLocalPath)
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log('logoImg', logoImg)

    if (!logoImg) {
        throw new ApiError(400, "logoImg file is required")
    }

    const cityObject = JSON.parse(city)

    console.log("cityObject", cityObject)

    const new_user = new User({
        owner_name,
        company_name,
        mobile_number,
        email,
        city: cityObject,
        logo: logoImg.url,
        address,
        description,
        password,
    })
    const user = await new_user.save({ validateBeforeSave: true })
    const createdUser = await User.findById(user._id).select(
        "-password -refresh_token"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {
    registerUser
}