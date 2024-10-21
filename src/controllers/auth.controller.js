import { User } from "../models/user.model.js"
import { asynchandler } from "../utils/asyncHandler.js"
import { Mongoose } from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudnaryUpload.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const access_token = user.generateAccessToken()
        const refresh_token = user.generateRefreshToken()
        user.refresh_token = refresh_token
        await user.save({ validateBeforeSave: false })

        return { access_token, refresh_token }

    } catch (error) {
        console.log("error", error)
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
// const loginUser = asynchandler(async (req, res) => {
//     // req body -> data
//     //  or mobile_number
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const { mobile_number, password } = req.body
//     console.log(mobile_number);

//     if (!password && !mobile_number) {
//         throw new ApiError(400, "password or mobile number is required")
//     }

//     // Here is an alternative of above code based on logic discussed in video:
//     // if (!( || mobile_number)) {
//     //     throw new ApiError(400, " or mobile_number is required")

//     // }

//     const user = await User.findOne({ mobile_number })


//     if (!user) {
//         throw new ApiError(404, "User does not exist")
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid user credentials")
//     }

//     const { access_token, refresh_token } = await generateAccessAndRefereshTokens(user._id)

//     // Find the user with the refresh token and update their record
//     const isTokensUpdate = await User.findOneAndUpdate(
//         { _id: user._id },
//         { $set: { access_token, refresh_token } } // Clear the refresh token in the database
//     );

//     if (!isTokensUpdate) throw new ApiError(400, "password or mobile number is required");

//     const loggedInUser = await User.findById(user._id).select("-password -refresh_token")
//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//         .status(200)
//         .cookie("access_token", access_token, options)
//         .cookie("refresh_token", refresh_token, options)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     user: loggedInUser, access_token, refresh_token
//                 },
//                 "User logged In Successfully"
//             )
//         )

// })

// Logout and invalidate refresh token
const loginUser = asynchandler(async (req, res) => {
    const { mobile_number, password } = req.body;

    // Check if both mobile number and password are provided
    if (!mobile_number || !password) {
        throw new ApiError(400, "Mobile number and password are required");
    }

    // Find user by mobile number
    const user = await User.findOne({ mobile_number });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate access and refresh tokens
    const { access_token, refresh_token } = await generateAccessAndRefereshTokens(user._id);

    // Update user tokens in the database
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { access_token, refresh_token } },
        { new: true }
    ).select("-password -refresh_token");  // Select fields excluding password and refresh_token

    if (!updatedUser) {
        throw new ApiError(400, "Unable to update tokens for the user");
    }

    // Cookie options
    const cookieOptions = {
        httpOnly: true, // Cookie not accessible via JS
        secure: process.env.NODE_ENV === "production", // Only send on HTTPS in production
        sameSite: "Strict", // Prevent CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // Set cookie expiration for 1 week
    };

    // Send response with cookies and user data
    return res
        .status(200)
        .cookie("access_token", access_token, cookieOptions)
        .cookie("refresh_token", refresh_token, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: updatedUser,
                    access_token,
                },
                "User logged in successfully"
            )
        );
});


const logout = asynchandler(async (req, res) => {
    const refreshToken = req.cookies.refresh_token || req.body.refresh_token;;

    console.log("refreshToken", refreshToken)

    // Ensure the refresh token exists in the request
    if (!refreshToken) {
        throw new ApiError(400, "Invalid user credentials")
        // return res.sendStatus(400); // Bad request if no refresh token is present
    }

    // Find the user with the refresh token and update their record
    const user = await User.findOneAndUpdate(
        { refresh_token: refreshToken },
        { $set: { refresh_token: "", access_token: "" } } // Clear the refresh token in the database
    );

    // If no user is found with the refresh token
    if (!user) {
        throw new ApiError(404, "Not found if no matching user")
        return res.sendStatus(404); // Not found if no matching user
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // Send success response with status 204 (No Content)
    return res
        .json(
            new ApiResponse(
                204,
                {
                    user: {}
                },
                "User logged Out Successfully"
            )
        )
});



const authenticateToken = asynchandler(async (req, _, next) => {
    try {
        //  const refreshToken = req.cookies.refresh_token || req.body.refresh_token;;


        const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        console.log("decodedToken user", decodedToken, user)
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})



const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {
    loginUser,
    logout,
    authenticateToken
}