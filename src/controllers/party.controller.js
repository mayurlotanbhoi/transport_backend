import { uploadOnCloudinary } from '../utils/cloudnaryUpload.js';
import { ApiError } from '../utils/ApiError.js';
import Party, { partyValidation } from '../models/party.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// CREATE Party
export const createParty = async (req, res) => {
    try {
        const { user_id } = req.user
        if (req.body?.city) req.body.city = JSON.parse(req.body.city);
        req.body.user_id = user_id

        const { error, value } = partyValidation.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);
        //   return res.status(400).json({ error: error.details[0].message });

        console.log("req.file", req.file)
        const logoLocalPath = req.file?.path;

        if (!logoLocalPath) {
            throw new ApiError(400, "Logo file is required");
        }

        const logoImg = await uploadOnCloudinary(logoLocalPath);
        if (!logoImg || !logoImg.url) {
            throw new ApiError(400, "Error uploading logo image");
        }

        const newParty = new Party({

            ...value,
            logo: logoImg.url,
        });

        const savedParty = await newParty.save();
        // res.status(201).json(savedParty);

        return res.json(
            new ApiResponse(200, savedParty, "Party registered successfully")
        );

    } catch (error) {
        throw new ApiError(500, error);
        console.log("error", error)
        // res.status(500).json({ error: 'Error creating party' });
    }
};


// READ Parties
export const getParties = async (req, res) => {
    try {
        const { user_id } = req.user
        const parties = await Party.find({ user_id }).sort({ _id: -1 });
        res.status(200).json(parties);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching parties' });
    }
};

// READ Single Party
export const getPartyById = async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ error: 'Party not found' });
        res.status(200).json(party);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching party' });
    }
};

// UPDATE Party
export const updateParty = async (req, res) => {
    try {
        if (req.body?.city) req.body.city = JSON.parse(req.body.city);

        const { error, value } = partyValidation.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ error: 'Party not found' });

        // Handle logo upload if a new one is provided
        let logoUrl = party.logo;
        if (req.files?.logo?.[0]?.path) {
            const newLogoPath = req.files.logo[0].path;
            const newLogoImg = await uploadOnCloudinary(newLogoPath);

            if (!newLogoImg || !newLogoImg.url) {
                throw new ApiError(400, "Error uploading new logo image");
            }

            // Delete the old logo from Cloudinary
            if (party.logo) {
                await deleteFromCloudinary(party.logo);
            }

            logoUrl = newLogoImg.url;
        }

        const updatedParty = await Party.findByIdAndUpdate(
            req.params.id,
            { ...value, logo: logoUrl },
            { new: true }
        );

        res.status(200).json(updatedParty);

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error updating party' });
    }
};


// DELETE Party
export const deleteParty = async (req, res) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ error: 'Party not found' });

        // Delete logo from Cloudinary if it exists
        if (party.logo) {
            await deleteFromCloudinary(party.logo);
        }

        await Party.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Party deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error deleting party' });
    }
};
