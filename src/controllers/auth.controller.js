import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refresh_token = refreshToken;
        user.access_token = accessToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Error generating access and refresh tokens");
    }
};

// Login user and set access and refresh tokens as cookies
const loginUser = asynchandler(async (req, res) => {
    const { mobile_number, password } = req.body;
    if (!mobile_number || !password) {
        throw new ApiError(400, "Mobile number and password are required");
    }

    const user = await User.findOne({ mobile_number });
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid Mobile number and password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // await User.findByIdAndUpdate(user._id, { $set: { access_token: accessToken, refresh_token: refreshToken } })

    const accessTokencookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
        path: '/',
        maxAge: 900000, //  15 minutes (in ms)
    };

    const refreshTokencookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
        path: '/',
        maxAge: 31557600000, // 1 year (in ms) 
    };


    // send responce
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokencookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokencookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: { ...user.toObject(), password: undefined, refresh_token: undefined }, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});


const reAuth = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken
    // console.log("req.cookies", req.cookies)

    // console.log("incomingRefreshToken", incomingRefreshToken)

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    // console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET)
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log("decodedToken", decodedToken)
    const user = await User.findById(decodedToken._id).select("-password -refresh_token");
    // console.log("user", user)

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // await User.findByIdAndUpdate(user._id, { $set: { access_token: accessToken, refresh_token: refreshToken } })
    const accessTokencookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
        path: '/',
        maxAge: 900000, //  15 minutes (in ms)
    };

    const refreshTokencookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
        path: '/',
        maxAge: 31557600000, // 1 year (in ms) 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokencookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokencookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: { ...user.toObject(), password: undefined }, accessToken },
                "User logged in successfully"
            )
        );
});
const logout = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    console.log("decodedToken", decodedToken);

    const user = await User.findByIdAndUpdate(
        decodedToken._id,
        { $set: { refreshtoken: "", accesstoken: "" } },
        { new: true } // Return the updated document
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Clear cookies securely
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});



// Middleware for authenticating access tokens
const authenticateToken = asynchandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Unauthorized request");
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refresh_token");
        if (!user) throw new ApiError(401, "Invalid access token");
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

// Refresh access token using refresh token
const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken
    console.log("req.cookies", req.cookies)

    console.log("incomingRefreshToken", incomingRefreshToken)

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET)

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decodedToken", decodedToken)

        const user = await User.findById(decodedToken._id).select("-password ");;
        console.log("user", user)

        // console.log("incomingRefreshToken !== user.refreshtoken", incomingRefreshToken !== user.refreshtoken)
        // || incomingRefreshToken !== user.refreshtoken

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        // Options for setting the access token cookie
        const accessTokencookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
            path: '/',
            maxAge: 900000, // Access token cookie valid for 15 minutes
        };

        // Options for setting the refresh token cookie
        const refreshTokencookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
            path: '/',
            maxAge: 31557600000, // Refresh token cookie valid for 1 year
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, accessTokencookieOptions)
            // .cookie("refreshToken", user?.refresh_token, refreshTokencookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { user: { ...user.toObject(), password: undefined, refresh_token: null }, accessToken, },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export {
    loginUser,
    logout,
    authenticateToken,
    refreshAccessToken,
    reAuth
};




// import { User } from "../models/user.model.js"
// import { asynchandler } from "../utils/asyncHandler.js"
// import { Mongoose } from "mongoose"
// import { uploadOnCloudinary } from "../utils/cloudnaryUpload.js"
// import { ApiError } from "../utils/ApiError.js"
// // import { ApiResponse } from "../utils/apiResponse.js"
// import jwt from "jsonwebtoken"
// import { ApiResponse } from "../utils/ApiResponse.js"

// const generateAccessAndRefereshTokens = async (userId) => {
//     try {
//         const user = await User.findById(userId)
//         const accesstoken = user.generateAccessToken()
//         const refreshtoken = user.generateRefreshToken()
//         user.refreshtoken = refreshtoken
//         await user.save({ validateBeforeSave: false })

//         return { accesstoken, refreshtoken }

//     } catch (error) {
//         console.log("error", error)
//         throw new ApiError(500, "Something went wrong while generating referesh and access token")
//     }
// }
// // const loginUser = asynchandler(async (req, res) => {
// //     // req body -> data
// //     //  or mobile_number
// //     //find the user
// //     //password check
// //     //access and referesh token
// //     //send cookie

// //     const { mobile_number, password } = req.body
// //     console.log(mobile_number);

// //     if (!password && !mobile_number) {
// //         throw new ApiError(400, "password or mobile number is required")
// //     }

// //     // Here is an alternative of above code based on logic discussed in video:
// //     // if (!( || mobile_number)) {
// //     //     throw new ApiError(400, " or mobile_number is required")

// //     // }

// //     const user = await User.findOne({ mobile_number })


// //     if (!user) {
// //         throw new ApiError(404, "User does not exist")
// //     }

// //     const isPasswordValid = await user.isPasswordCorrect(password)

// //     if (!isPasswordValid) {
// //         throw new ApiError(401, "Invalid user credentials")
// //     }

// //     const { accesstoken, refreshtoken } = await generateAccessAndRefereshTokens(user._id)

// //     // Find the user with the refresh token and update their record
// //     const isTokensUpdate = await User.findOneAndUpdate(
// //         { _id: user._id },
// //         { $set: { accesstoken, refreshtoken } } // Clear the refresh token in the database
// //     );

// //     if (!isTokensUpdate) throw new ApiError(400, "password or mobile number is required");

// //     const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")
// //     const options = {
// //         httpOnly: true,
// //         secure: true
// //     }

// //     return res
// //         .status(200)
// //         .cookie("accesstoken", accesstoken, options)
// //         .cookie("refreshtoken", refreshtoken, options)
// //         .json(
// //             new ApiResponse(
// //                 200,
// //                 {
// //                     user: loggedInUser, accesstoken, refreshtoken
// //                 },
// //                 "User logged In Successfully"
// //             )
// //         )

// // })

// // Logout and invalidate refresh token
// const loginUser = asynchandler(async (req, res) => {
//     const { mobile_number, password } = req.body;

//     // Check if both mobile number and password are provided
//     if (!mobile_number || !password) {
//         throw new ApiError(400, "Mobile number and password are required");
//     }

//     // Find user by mobile number
//     const user = await User.findOne({ mobile_number });
//     if (!user) {
//         throw new ApiError(404, "User does not exist");
//     }

//     // Validate password
//     const isPasswordValid = await user.isPasswordCorrect(password);
//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid user credentials");
//     }

//     // Generate access and refresh tokens
//     const { accesstoken, refreshtoken } = await generateAccessAndRefereshTokens(user._id);

//     // Update user tokens in the database
//     const updatedUser = await User.findByIdAndUpdate(
//         user._id,
//         { $set: { accesstoken, refreshtoken } },
//         { new: true }
//     ).select("-password -refreshtoken");  // Select fields excluding password and refreshtoken

//     if (!updatedUser) {
//         throw new ApiError(400, "Unable to update tokens for the user");
//     }

//     // Cookie options
//     const cookieOptions = {
//         httpOnly: true, // Cookie not accessible via JS
//         secure: process.env.NODE_ENV === "production", // Only send on HTTPS in production
//         sameSite: "Strict", // Prevent CSRF
//         maxAge: 7 * 24 * 60 * 60 * 1000 // Set cookie expiration for 1 week
//     };

//     // Send response with cookies and user data
//     return res
//         .status(200)
//         .cookie("accesstoken", accesstoken, cookieOptions)
//         .cookie("refreshtoken", refreshtoken, cookieOptions)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     user: updatedUser,
//                     accesstoken,
//                 },
//                 "User logged in successfully"
//             )
//         );
// });


// const logout = asynchandler(async (req, res) => {
//     const refreshToken = req.cookies.refreshtoken || req.body.refreshtoken;;

//     console.log("refreshToken", refreshToken)

//     // Ensure the refresh token exists in the request
//     if (!refreshToken) {
//         throw new ApiError(400, "Invalid user credentials")
//         // return res.sendStatus(400); // Bad request if no refresh token is present
//     }

//     // Find the user with the refresh token and update their record
//     const user = await User.findOneAndUpdate(
//         { refreshtoken: refreshToken },
//         { $set: { refreshtoken: "", accesstoken: "" } } // Clear the refresh token in the database
//     );

//     // If no user is found with the refresh token
//     if (!user) {
//         throw new ApiError(404, "Not found if no matching user")
//         return res.sendStatus(404); // Not found if no matching user
//     }

//     // Clear the refresh token cookie
//     res.clearCookie('refreshToken');
//     res.clearCookie('accesstoken');
//     res.clearCookie('refreshtoken');

//     // Send success response with status 204 (No Content)
//     return res
//         .json(
//             new ApiResponse(
//                 204,
//                 {
//                     user: {}
//                 },
//                 "User logged Out Successfully"
//             )
//         )
// });



// const authenticateToken = asynchandler(async (req, _, next) => {
//     try {
//         //  const refreshToken = req.cookies.refreshtoken || req.body.refreshtoken;;


//         const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "")

//         // console.log(token);
//         if (!token) {
//             throw new ApiError(401, "Unauthorized request")
//         }

//         const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET)
//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

//         console.log("decodedToken user", decodedToken, user)
//         if (!user) {
//             throw new ApiError(401, "Invalid Access Token")
//         }

//         req.user = user;
//         next()
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid access token")
//     }

// })



// const refreshAccessToken = asynchandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "unauthorized request")
//     }

//     try {
//         const decodedToken = jwt.verify(
//             incomingRefreshToken,
//             process.env.REFRESHTOKEN_SECRET
//         )

//         const user = await User.findById(decodedToken?._id)

//         if (!user) {
//             throw new ApiError(401, "Invalid refresh token")
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Refresh token is expired or used")

//         }

//         const options = {
//             httpOnly: true,
//             secure: true
//         }

//         const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(
//                 new ApiResponse(
//                     200,
//                     { accessToken, refreshToken: newRefreshToken },
//                     "Access token refreshed"
//                 )
//             )
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid refresh token")
//     }

// })


// export {
//     loginUser,
//     logout,
//     authenticateToken,
//     refreshAccessToken
// }