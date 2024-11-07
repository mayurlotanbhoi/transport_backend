import mongoose, { Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import Joi from 'joi';

const AutoIncrement = AutoIncrementFactory(mongoose);

const partySchema = new Schema({
    party_id: {
        type: Number,
        index: true,
    },
    user_id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    contact: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    city: {
        _id: { type: Schema.Types.ObjectId },
        cityID: { type: Number, required: true },
        cityName: { type: String, trim: true, required: true },
        stateID: { type: Number, required: true },
        stateName: { type: String, trim: true, required: true },
        stateShortName: { type: String, trim: true, required: true },
        countryName: { type: String, trim: true, required: true },
        countryID: { type: Number, required: true }
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    logo: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Auto-increment party_id
partySchema.plugin(AutoIncrement, { inc_field: 'party_id' });

const Party = mongoose.model('Party', partySchema);
export default Party;




export const partyValidation = Joi.object({
    user_id: Joi.number().required(),
    name: Joi.string().trim().required(),
    contact: Joi.string()
        .trim()
        .pattern(/^\d{10}$/)
        .required()
        .messages({ "string.pattern.base": "Please enter a valid 10-digit mobile number" }),
    city: Joi.object({
        _id: Joi.string(),
        cityID: Joi.number().required(),
        cityName: Joi.string().required(),
        stateID: Joi.number().required(),
        stateName: Joi.string().required(),
        stateShortName: Joi.string().required(),
        countryName: Joi.string().required(),
        countryID: Joi.number().required(),
    }).required().messages({
        'any.required': 'City information is required',
    }),
    address: Joi.string().trim().required(),
    logo: Joi.string().trim().optional()
});