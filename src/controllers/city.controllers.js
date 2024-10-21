
import { asynchandler } from "../utils/asyncHandler.js"
import { Mongoose } from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudnaryUpload.js"
import { ApiError } from "../utils/ApiError.js"
import { City } from "../models/city.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
// import { ApiResponse } from "../utils/apiResponse.js"


const getCitiByName = asynchandler(async (req, res) => {
    const query = req.query.query;  // Correctly accessing the query parameter

    console.log("query", query);

    if (!query) {
        return res.status(400).json({
            success: false,
            message: "City name is required",
        });
    }

    // Perform a case-insensitive search for cities starting with the specified substring
    const cities = await City.find(
        { cityName: { $regex: new RegExp(`^${query}`, "i") } } // Correct regex usage
    ).select('-__v');

    if (cities.length === 0) {
        throw new ApiError(404, "No cities found");
    }

    return res.status(200).json(
        new ApiResponse(200, cities, "Cities found")
    );
});


export {
    getCitiByName
}
