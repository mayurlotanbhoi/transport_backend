// controllers/tripHistoryController.js
// import tripHistory from '../models/tripHistory.js';
import { tripHistory, tripHistoryValidation } from '../models/Trip_History.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
// import { ApiResponse } from '../utils/apiResponse.js';
import { asynchandler } from '../utils/asyncHandler.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { VehicaleRunningStatus } from '../utils/VehicaleRunningStatus.js';
// import tripHistoryValidation from '../validations/tripHistoryValidation.js';

// Create a new trip history
export const createTripHistory = asynchandler(async (req, res, next) => {
    //   from token data
    const { user_id } = req?.user
    req.body.user_id = user_id

    const partyString = req.body?.Party || ""; // Default to an empty string if `Party` is undefined
    const party = partyString?.split("ID =");
    const [partyName, party_id] = party
    req.body.party_id = party_id
    delete req.body?.Party

    console.log("partyName,party_id", partyName, party_id)

    // if (match) {
    //     const partyName = match[0].trim(); // Extracts the name part and trims whitespace
    //     const id = parseInt(match[1], 10); // Extracts the ID as a number

    //     console.log("Party Name:", partyName);
    //     console.log("ID:", id);
    // } else {
    //     console.log("The format does not match or ID is missing.");
    // }


    // Validate request body
    const { error, value } = tripHistoryValidation.validate(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const trip = await tripHistory.findOne({ user_id, vehicale_number: value?.vehicale_number })
        .sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the latest trip

    if (trip) {
        const { createdAt, speed_per_hr, distance_km } = trip;
        const isVehicalRunning = VehicaleRunningStatus(createdAt, speed_per_hr, distance_km);

        if (isVehicalRunning) {
            throw new ApiError(400, "Vehicle is already on a trip");
        }
    }



    // Create and save the new trip history
    const newTrip = new tripHistory(value);
    const savedTrip = await newTrip.save();

    if (!savedTrip) {
        throw new ApiError(400, "Unable to update tokens for the user");
    }

    // Send response with cookies and user data
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    savedTrip,

                },
                "New Trip Created successfully"
            )
        );
    // res.status(201).json(savedTrip);

});

export const getAllTripHistories = asynchandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
        console.log('user_id:', user_id);

        const trips = await tripHistory.aggregate([
            {
                $match: { user_id } // Match trips by user_id
            },
            {
                $lookup: {
                    from: "parties",                // Collection to join
                    localField: "party_id",         // Field in tripHistory
                    foreignField: "party_id",       // Field in parties (make sure both use the same field name)
                    as: "party_info"                // Output array containing matching party details
                }
            },
            {
                $unwind: {
                    path: "$party_info",
                    preserveNullAndEmptyArrays: true // Include trips even if there's no matching party
                }
            },
            {
                $project: {
                    // Fields from tripHistory
                    vehicale_number: 1,
                    loading_city: 1,
                    unloading_city: 1,
                    freigth: 1,
                    advance: 1,
                    balance: 1,
                    cumition: 1,
                    driver_contact: 1,
                    driver_name: 1,
                    distance_km: 1,
                    speed_per_hr: 1,
                    load_goods: 1,
                    load_weigth: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    trip_id: 1,

                    // Fields from party_info (joined from parties)
                    Party_name: "$party_info.name",
                    Party_contact: "$party_info.contact",
                }
            },
            {
                $sort: {
                    createdAt: -1
                }  // Sort by createdAt descending
            }
        ]);



        res.status(200).json(trips);
    } catch (err) {
        next(err);
    }
});


export const downloadExelFormatAllTripHistories = asynchandler(async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const { format } = req.params;
        const trips = await tripHistory.aggregate([
            {
                $match: { user_id } // Match trips by user_id
            },
            {
                $lookup: {
                    from: "parties",                // Collection to join
                    localField: "party_id",         // Field in tripHistory
                    foreignField: "party_id",       // Field in parties (make sure both use the same field name)
                    as: "party_info"                // Output array containing matching party details
                }
            },
            {
                $unwind: {
                    path: "$party_info",
                    preserveNullAndEmptyArrays: true // Include trips even if there's no matching party
                }
            },
            {
                $project: {
                    // Fields from tripHistory
                    vehicale_number: 1,
                    loading_city: 1,
                    unloading_city: 1,
                    freigth: 1,
                    advance: 1,
                    balance: 1,
                    cumition: 1,
                    driver_contact: 1,
                    driver_name: 1,
                    distance_km: 1,
                    speed_per_hr: 1,
                    load_goods: 1,
                    load_weigth: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    trip_id: 1,

                    // Fields from party_info (joined from parties)
                    Party_name: "$party_info.name",
                    Party_contact: "$party_info.contact",
                }
            },
            {
                $sort: {
                    createdAt: -1
                }  // Sort by createdAt descending
            }
        ]);

        if (!trips || trips.length === 0) {
            return res.status(404).json({ message: 'No trip data found for the user' });
        }

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Trips');
            // Define header row
            worksheet.columns = [
                { header: 'Loading Date', key: 'Loading_Date', width: 20 },
                { header: 'Vehicle Number', key: 'vehicle_number', width: 15 },
                { header: 'Party Name', key: 'party_name', width: 20 },
                { header: 'Party Contact', key: 'party_contact', width: 15 },
                { header: 'Loading City', key: 'loading_city', width: 20 },
                { header: 'Unloading City', key: 'unloading_city', width: 20 },
                { header: 'Freight', key: 'freight', width: 10 },
                { header: 'Advance', key: 'advance', width: 10 },
                { header: 'Balance', key: 'balance', width: 10 },
                { header: 'Commission', key: 'commission', width: 12 },
                { header: 'Driver Contact', key: 'driver_contact', width: 15 },
                { header: 'Driver Name', key: 'driver_name', width: 15 },
                { header: 'Distance (km)', key: 'distance_km', width: 12 },
                { header: 'Speed (per hr)', key: 'speed_per_hr', width: 12 },
                { header: 'Load Goods', key: 'load_goods', width: 15 },
                { header: 'Load Weight', key: 'load_weight', width: 12 },
                { header: 'Payment Date', key: 'payment_date', width: 15 },
            ];

            // Add data rows with conditional formatting
            trips.forEach(trip => {
                const row = worksheet.addRow({
                    Loading_Date: new Date(trip.createdAt).toLocaleDateString(),
                    vehicle_number: trip.vehicale_number,
                    party_name: trip.Party_name || 'N/A',
                    party_contact: trip.Party_contact || 'N/A',
                    loading_city: `${trip.loading_city.cityName || ''}, ${trip.loading_city.stateShortName || ''}`,
                    unloading_city: `${trip.unloading_city.cityName || ''}, ${trip.unloading_city.stateShortName || ''}`,
                    freight: trip.freigth,
                    advance: trip.advance,
                    balance: trip.balance,
                    commission: trip.cumition,
                    driver_contact: trip.driver_contact,
                    driver_name: trip.driver_name,
                    distance_km: trip.distance_km,
                    speed_per_hr: trip.speed_per_hr,
                    load_goods: trip.load_goods,
                    load_weight: trip.load_weigth,
                    payment_date: trip.payment_date?.toLocaleDateString() || 'N/A',
                });

                // Apply red font to the entire row if commission is 0
                if (trip.cumition === 0) {
                    row.eachCell(cell => {
                        cell.font = { color: { argb: 'FF0000' } }; // Red color for each cell in the row
                    });
                }
            });

            console.log("Sending Excel file...");
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=trip_history.xlsx');
            await workbook.xlsx.write(res);
            res.end();

        } else if (format === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=trip_history.pdf');
            doc.pipe(res);

            doc.fontSize(18).text('Trip History Report', { align: 'center' }).moveDown();
            trips.forEach(trip => {
                doc.fontSize(12).text(`Loading Date: ${new Date(trip.createdAt).toISOString()}`);
                doc.fontSize(12).text(`Vehicle Number: ${trip.vehicale_number}`);
                doc.text(`Party Name: ${trip.Party_name || 'N/A'}`);
                doc.text(`Party Contact: ${trip.Party_contact || 'N/A'}`);
                doc.text(`Loading City: ${trip.loading_city.cityName || ''}, ${trip.loading_city.stateShortName || ''}`);
                doc.text(`Unloading City: ${trip.unloading_city.cityName || ''}, ${trip.unloading_city.stateShortName || ''}`);
                doc.text(`Freight: ${trip.freigth}`);
                doc.text(`Advance: ${trip.advance}`);
                doc.text(`Balance: ${trip.balance}`);
                doc.text(`Commission: ${trip.cumition}`);
                doc.text(`Driver Contact: ${trip.driver_contact}`);
                doc.text(`Driver Name: ${trip.driver_name}`);
                doc.text(`Distance (km): ${trip.distance_km}`);
                doc.text(`Speed (km/hr): ${trip.speed_per_hr}`);
                doc.text(`Load Goods: ${trip.load_goods}`);
                doc.text(`Load Weight: ${trip.load_weigth}`);
                doc.text(`Payment Date: ${trip.payment_date?.toLocaleDateString() || 'N/A'}`);
                doc.moveDown();
            });

            doc.end();

        } else {
            return res.status(400).json({ message: "Invalid format. Use 'excel' or 'pdf' as format." });
        }
    } catch (err) {
        next(new ApiError(500, "An error occurred while generating the file"));
    }
});





// Get a single trip history by ID
export const getTripHistoryById = asynchandler(async (req, res, next) => {
    try {
        const { user_id: id } = req?.user;
        const trip = await tripHistory.findById(id);
        if (!trip) {
            return res.status(404).json({ error: 'Trip history not found' });
        }
        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
});

// Update a trip history by ID
export const updateTripHistory = asynchandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate request body
        const { error, value } = tripHistoryValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Find and update the trip history
        const updatedTrip = await tripHistory.findByIdAndUpdate(id, value, { new: true, runValidators: true });
        if (!updatedTrip) {
            return res.status(404).json({ error: 'Trip history not found' });
        }
        res.status(200).json(updatedTrip);
    } catch (err) {
        next(err);
    }
});

// Delete a trip history by ID
export const deleteTripHistory = asynchandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTrip = await tripHistory.findByIdAndDelete(id);
        if (!deletedTrip) {
            return res.status(404).json({ error: 'Trip history not found' });
        }
        res.status(200).json({ message: 'Trip history deleted successfully' });
    } catch (err) {
        next(err);
    }
});
