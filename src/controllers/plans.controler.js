// controllers/tripHistoryController.js
// import tripHistory from '../models/tripHistory.js';
import PlanHistory from '../models/plan_History.model.js';
import { tripHistory, tripHistoryValidation } from '../models/Trip_History.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
// import { ApiResponse } from '../utils/apiResponse.js';
import { asynchandler } from '../utils/asyncHandler.js';
// import tripHistoryValidation from '../validations/tripHistoryValidation.js';

// Create a new trip history
// export const createTripHistory = asynchandler(async (req, res, next) => {
//     //   from token data
//     const { user_id } = req?.user
//     req.body.user_id = user_id
//     // Validate request body
//     const { error, value } = tripHistoryValidation.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }


//     // Create and save the new trip history
//     const newTrip = new tripHistory(value);
//     const savedTrip = await newTrip.save();

//     if (!savedTrip) {
//         throw new ApiError(400, "Unable to update tokens for the user");
//     }

//     // Send response with cookies and user data
//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     savedTrip,

//                 },
//                 "New Trip Created successfully"
//             )
//         );
//     // res.status(201).json(savedTrip);

// });

// Get all trip histories
export const getYourPlance = asynchandler(async (req, res, next) => {
    try {
        const { user_id } = req.user
        const plance = await PlanHistory.find({ user_id }).sort({ createdAt: -1 });
        // res.status(200).json(plance);

        return res.status(200).json(
            new ApiResponse(200, plance, "Plan History fectched successfully")
        );
    } catch (err) {
        next(err);
    }
});

// Get a single trip history by ID
// export const getTripHistoryById = asynchandler(async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const trip = await tripHistory.findById(id);
//         if (!trip) {
//             return res.status(404).json({ error: 'Trip history not found' });
//         }
//         res.status(200).json(trip);
//     } catch (err) {
//         next(err);
//     }
// });

// Update a trip history by ID
// export const updateTripHistory = asynchandler(async (req, res, next) => {
//     try {
//         const { id } = req.params;

//         // Validate request body
//         const { error, value } = tripHistoryValidation.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         // Find and update the trip history
//         const updatedTrip = await tripHistory.findByIdAndUpdate(id, value, { new: true, runValidators: true });
//         if (!updatedTrip) {
//             return res.status(404).json({ error: 'Trip history not found' });
//         }
//         res.status(200).json(updatedTrip);
//     } catch (err) {
//         next(err);
//     }
// });

// Delete a trip history by ID
// export const deleteTripHistory = asynchandler(async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const deletedTrip = await tripHistory.findByIdAndDelete(id);
//         if (!deletedTrip) {
//             return res.status(404).json({ error: 'Trip history not found' });
//         }
//         res.status(200).json({ message: 'Trip history deleted successfully' });
//     } catch (err) {
//         next(err);
//     }
// });
