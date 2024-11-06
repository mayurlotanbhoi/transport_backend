import { asynchandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudnaryUpload.js";
import { ApiError } from "../utils/ApiError.js"
// import { ApiResponse } from "../utils/apiResponse.js"
import { vehicaleDetails, vehicleSchema } from "../models/lorry_details.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { vehicleSchema } from "../models/lorry_details.model.js";

const registerVehicle = asynchandler(async (req, res) => {
    // get Vehicale details from frontend
    // validation - not empty
    // check if Vehicale already exists: with Vehicale number and clint id
    // check for images, check for Permit Photo,Owner Photo, Insurance Photo
    // upload them to cloudinary,
    // create Vehicale object - create entry in db
    // check for Vehicale creation
    // return res
    // Validate the request body

    console.log("req.user nknk", req?.user)


    if (typeof req.body.owner_city === 'string') {
        req.body.owner_city = JSON.parse(req.body.owner_city);
        delete req.body.owner_city.__v;
    }

    const { error } = vehicleSchema.validate(req.body);

    // console.log("req.body", req.body)
    // console.log("JSON.parse(req.body)", JSON.parse(req.body))
    console.log("error.details[0].message", error)
    if (error) {
        throw new ApiError(400, error?.details[0]?.message || 'Validation Faild');
    }

    const {
        vehicale_type,
        vehicale_capacity,
        vehicale_length,
        lorry_number,
        owner_name,
        owner_mobile_number,
        owner_addres,
        owner_pancard_number,
        aadharcard_number,
        permit_expire_date,
        insurance_expire_date,
        fitness_expire_date,
        owner_city,
    } = req.body;

    // Validation - not empty
    if (
        [vehicale_type,
            vehicale_capacity,
            lorry_number,
            owner_name,
            owner_mobile_number,
            owner_addres,
            owner_pancard_number,
            aadharcard_number,
            permit_expire_date,
            insurance_expire_date,
            fitness_expire_date,
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //   from token data
    const { user_id } = req?.user
    // Check if Vehicle already exists: with Vehicle number
    const existedVehicle = await vehicaleDetails.findOne({ lorry_number, user_id });
    console.log("existedVehicle", existedVehicle)
    if (existedVehicle) {
        throw new ApiError(409, "Vehicle with this lorry number already exists");
    }

    // Check for images
    const { permit_photo, owner_photo, insurance_photo } = req.files;

    console.log(owner_photo)

    if (!permit_photo || !owner_photo || !insurance_photo) {
        throw new ApiError(400, "All images (Permit, Owner, Insurance) are required");
    }

    // Upload images to cloudinary
    const permitImg = await uploadOnCloudinary(permit_photo[0].path);
    const ownerImg = await uploadOnCloudinary(owner_photo[0].path);
    const insuranceImg = await uploadOnCloudinary(insurance_photo[0].path);

    if (!permitImg || !ownerImg || !insuranceImg) {
        throw new ApiError(400, "One or more image uploads failed");
    }

    // Create Vehicle object and entry in DB
    const new_vehicle = new vehicaleDetails({
        vehicale_type,
        user_id,
        vehicale_capacity,
        vehicale_length,
        lorry_number,
        owner_name,
        owner_mobile_number,
        owner_addres,
        owner_pancard_number,
        aadharcard_number,
        permit_expire_date,
        insurance_expire_date,
        fitness_expire_date,
        owner_city,
        permit_photo: permitImg.url,
        owner_photo: ownerImg.url,
        insurance_photo: insuranceImg.url,
    });

    const vehicle = await new_vehicle.save({ validateBeforeSave: true });

    if (!vehicle) {
        throw new ApiError(500, "Something went wrong while registering the vehicle");
    }

    return res.status(201).json(
        new ApiResponse(200, vehicle, "Vehicle registered Successfully")
    );
});

const getAllVehicles = asynchandler(async (req, res) => {
    const { user_id } = req.user;
    const vehicles = await vehicaleDetails.find({ user_id }).select(' -_id').sort({ _id: -1 });

    // Extract the `lorry_number` fields into a single array
    const vehicle_num = vehicles.map(vehicle => vehicle.lorry_number);
    return res.status(201).json(
        new ApiResponse(200, { vehicle_num, vehicles }, "Successfully")
    );
})

export { registerVehicle, getAllVehicles };