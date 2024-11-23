import { User, userValidation } from "../models/user.model.js"
import { asynchandler } from "../utils/asyncHandler.js"
import { Mongoose } from "mongoose"
import { uploadOnCloudinary, uploadToCloudinary } from "../utils/cloudnaryUpload.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Plan from "../models/plan_History.model.js"

// import { ApiResponse } from "../utils/apiResponse.js"
// Assuming both classes are in the same file

// const defaultFreeePlane = {

//     user_id,
//     activationStartDate,
//     activationEndDate,
//     activationPlan,
//     amount
// }





// const registerUser = asynchandler(async (req, res) => {
//     // get user details from frontend
//     // validation - not empty
//     // check if user already exists: username, email
//     // check for images, check for avatar
//     // upload them to cloudinary, avatar
//     // create user object - create entry in db
//     // remove password and refresh token field from response
//     // check for user creation
//     // return res

//     // const { owner_name, company_name, mobile_number, email,
//     //     address, description, password, city
//     // } = req.body
//     // //console.log("email: ", email);

//     // if (
//     //     [owner_name, company_name, mobile_number, email,
//     //         address, description, password, city].some((field) => field?.trim() === "")
//     // ) {
//     //     throw new ApiError(400, "All fields are required")
//     // }

//     // Validate request body
//     const { mobile_number } = req.body
//     const { error, value } = userValidation.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }

//     const existedUser = await User.findOne({
//         mobile_number
//     })

//     if (existedUser) {
//         throw new ApiError(409, "User with mobile_number already exists")
//     }
//     // console.log(req.file);

//     const logoLocalPath = req.file?.path?.log;
//     const avatarLocalPath = req.file?.path?.avatar;
//     //const coverImageLocalPath = req.files?.coverImage[0]?.path;

//     // let coverImageLocalPath;
//     // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//     //     coverImageLocalPath = req.files.coverImage[0].path
//     // }
//     if (!avatarLocalPath) {
//         throw new ApiError(400, "avatar file is required")
//     }

//     if (!logoLocalPath) {
//         throw new ApiError(400, "Logo file is required")
//     }

//     const logoImg = await uploadOnCloudinary(logoLocalPath)
//     const avatar = await uploadOnCloudinary(avatarLocalPath)

//     console.log('logoImg', logoImg)

//     if (!logoImg) {
//         throw new ApiError(400, "logoImg file is required")
//     }

//     const cityObject = JSON.parse(city)

//     console.log("cityObject", cityObject)



//     // Create and save the new trip history
//     const addefaltFreePlen = new Plan({
//         activation_start_date: new Date(),
//         activation_end_date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days later
//         activationPlan: "Free",
//         amount: 0
//     });



//     const defaultPlane = await addefaltFreePlen.save();



//     const new_user = new User({
//         ...value,
//         current_plan_id: defaultPlane?.plan_id,
//         city: cityObject,
//         logo: logoImg.url,
//         avatar: avatar.url
//     })
//     const user = await new_user.save({ validateBeforeSave: true })
//     const createdUser = await User.findById(user._id).select(
//         "-password -refresh_token"
//     )
//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user")
//     }

//     const updatePlanAddUserId = await Plan.findByIdAndUpdate(
//         defaultPlane?._id,
//         { $set: { user_id: user.user_id } });

//     if (updatePlanAddUserId) {
//         throw new ApiError(500, "Something went wrong while Activating free plane the user")

//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User registered Successfully")
//     )
// })

const registerUser = asynchandler(async (req, res) => {
    // Validate request body
    req.body.city = JSON.parse(req.body?.city)
    console.log("req.city", req.body.city)


    delete req.body?.retype_password

    const { mobile_number, } = req.body;
    const { error, value } = userValidation.validate(req.body);

    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    // Check if user already exists
    const existedUser = await User.findOne({ mobile_number });
    if (existedUser) {
        throw new ApiError(409, "User with mobile number already exists");
    }

    // ***********************************
    // Ensure avatar and logo files are provided
    // const logoLocalPath = req.files?.logo[0]?.path;
    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // console.log("logoLocalPath", req.files)
    // console.log("avatarLocalPath", avatarLocalPath)

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required");
    // }
    // if (!logoLocalPath) {
    //     throw new ApiError(400, "Logo file is required");
    // }

    // // Upload images to cloud storage
    // const logoImg = await uploadOnCloudinary(logoLocalPath);
    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required");
    // }
    // if (!logoLocalPath) {
    //     throw new ApiError(400, "Logo file is required");
    // }

    // if (!logoImg || !avatar) {
    //     throw new ApiError(400, "Error uploading logo or avatar image");
    // }
    // *****************

    // upload direct file start
    // Ensure avatar and logo files are provided
    const logoLocalPath = req.files?.logo[0].buffer;
    const avatarLocalPath = req.files?.avatar[0].buffer;

    // Upload images to cloud storage
    const logoImg = await uploadToCloudinary(logoLocalPath);
    const avatar = await uploadToCloudinary(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    if (!logoLocalPath) {
        throw new ApiError(400, "Logo file is required");
    }
    if (!logoImg || !avatar) {
        throw new ApiError(400, "Error uploading logo or avatar image");
    }
    // upload direct file end


    // Parse city information
    // const cityObject = JSON.parse(city)

    // Create a default 15-day free plan
    const freePlan = new Plan({
        activation_start_date: new Date(),
        activation_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days later
        activation_Plan: "Free",
        amount: 0
    });
    const defaultPlan = await freePlan.save();

    // Create the new user
    const newUser = new User({
        ...value,
        current_plan_id: defaultPlan?.plan_id,
        // city: cityObject,
        // logo: logoImg.url,
        // avatar: avatar.url

        logo: logoImg,
        avatar: avatar
    });
    const savedUser = await newUser.save();

    // Associate the free plan with the user's ID
    await Plan.findByIdAndUpdate(
        defaultPlan._id,
        { $set: { user_id: savedUser.user_id } }
    );

    // Fetch created user details without password and refresh token
    const createdUser = await User.findById(savedUser._id).select("-password -refresh_token");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully with a 15-day free plan")
    );
});

const updateLogo = asynchandler(async (req, res) => {
    const { _id } = req.user;
    // Check if the logo file is provided
    const logoLocalPath = req.file.buffer
    if (!logoLocalPath) {
        throw new ApiError(400, "Logo file is required");
    }
    // Upload the logo to Cloudinary or a similar service
    const logoImg = await uploadToCloudinary(logoLocalPath);
    if (!logoImg) { // Corrected the condition
        throw new ApiError(400, "Logo uploading failed. Please try again");
    }
    // Update the user's logo field in the database
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $set: { logo: logoImg } },
        { new: true } // Return the updated document
    ).select("-password -refresh_token");;

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }
    // Send a success response
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "User updated successfully "
        )
    );
});

const updateAvatar = asynchandler(async (req, res) => {
    const { _id } = req.user;
    // Check if the logo file is provided
    const AvatarPath = req.file.buffer
    if (!AvatarPath) {
        throw new ApiError(400, "profile file is required");
    }
    // Upload the logo to Cloudinary or a similar service
    const Avatar = await uploadToCloudinary(AvatarPath);
    if (!Avatar) { // Corrected the condition
        throw new ApiError(400, "profile uploading failed. Please try again");
    }
    // Update the user's logo field in the database
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $set: { avatar: Avatar } },
        { new: true } // Return the updated document
    ).select("-password -refresh_token");;

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }
    // Send a success response
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "User updated successfully "
        )
    );
});

const updateUserInfo = asynchandler(async (req, res) => {
    const { _id } = req.user;
    const { address, company_name, description, email, owner_name, route } = req.body

    Object.entries({
        address,
        company_name,
        description,
        email,
        owner_name,
        route
    }).forEach(([key, value]) => {
        if (!value || value.trim() === "") { // Check if the value is not provided or is empty
            throw new ApiError(404, `${key.replace('_', ' ')} is required.`);
        }
    });

    // Update the user's logo field in the database
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $set: { address, company_name, description, email, owner_name, route } },
        { new: true } // Return the updated document
    ).select("-password -refresh_token");;

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }
    // Send a success response
    return res.status(200).json(
        new ApiResponse(
            200,

            updatedUser,
            "User updated successfully "
        )
    );
});

export {
    registerUser,
    updateLogo,
    updateAvatar,
    updateUserInfo
}