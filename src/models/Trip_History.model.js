// models/tripHistory.js
import mongoose, { Schema, Types } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import Joi from 'joi';

const AutoIncrement = AutoIncrementFactory(mongoose);

const TripsDetailsSchema = new Schema({
    trip_id: {
        type: Number,
        unique: true,
        index: true
    },
    user_id: {
        type: Number,
        required: true,
        index: true
    },

    vehicale_number: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    party_id: {
        type: Number,
        index: true,
        required: true,
    },

    // Party_name: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    // Party_contact: {
    //     type: String,
    //     required: [true, "Mobile number is required"],
    //     trim: true,
    //     match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    //     minlength: [10, "Mobile number must be exactly 10 digits"],
    //     maxlength: [10, "Mobile number must be exactly 10 digits"],
    // },

    loading_city: {
        _id: { type: Types.ObjectId },
        cityID: { type: Number, required: true },
        cityName: { type: String, trim: true, required: true },
        stateID: { type: Number, required: true },
        stateName: { type: String, trim: true, required: true },
        stateShortName: { type: String, trim: true, required: true },
        countryName: { type: String, trim: true, required: true },
        countryID: { type: Number, required: true }
    },
    unloading_city: {
        _id: { type: Types.ObjectId },
        cityID: { type: Number, required: true },
        cityName: { type: String, trim: true, required: true },
        stateID: { type: Number, required: true },
        stateName: { type: String, trim: true, required: true },
        stateShortName: { type: String, trim: true, required: true },
        countryName: { type: String, trim: true, required: true },
        countryID: { type: Number, required: true }
    },

    freigth: {
        type: Number,
        required: true,
    },
    advance: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    cumition: {
        type: Number,
        required: true,
    },
    full_payment: {
        type: Number,
        default: 0
    },
    payment_date: {
        type: Date,
        required: false,
    },

    driver_contact: {
        type: String,
        required: [true, "Mobile number is required"],
        trim: true,
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
        minlength: [10, "Mobile number must be exactly 10 digits"],
        maxlength: [10, "Mobile number must be exactly 10 digits"],
    },
    driver_name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 400
    },
    distance_km: {
        type: Number,
        required: true,
    },

    speed_per_hr: {
        type: Number,
        required: true,
    },

    load_goods: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 400
    },
    load_weigth: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 400
    },

}, {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

TripsDetailsSchema.plugin(AutoIncrement, { inc_field: 'trip_id' });
const tripHistory = mongoose.model('tripHistory', TripsDetailsSchema);


// validations/tripHistoryValidation.js


const tripHistoryValidation = Joi.object({
    user_id: Joi.number()
        .required()
        .messages({
            'number.base': 'User ID must be a number',
            'any.required': 'User ID is required',
        }),
    vehicale_number: Joi.string()
        .length(10)
        .pattern(/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/)
        .required()
        .messages({
            'string.base': 'Vehicle number must be a string',
            'string.length': 'Vehicle number must be exactly 10 characters',
            'string.pattern.base': "Invalid vehicle number format. Expected format: XX00XX0000",
            'any.required': 'Vehicle number is required',
        }),


    party_id: Joi.number()
        .required()
        .messages({
            'number.base': 'Party ID must be a number',
            'any.required': 'Party ID is required',
        }),
    // Party_name: Joi.string()
    //     .required()
    //     .min(3)
    //     .max(40)
    //     .messages({
    //         'string.base': 'Party name must be a string',
    //         'string.min': 'Party name must be at least 3 characters long',
    //         'string.max': 'Party name must be less than 40 characters long',
    //         'any.required': 'Party name is required',
    //     }),
    // Party_contact: Joi.string()
    //     .length(10)
    //     .pattern(/^\d{10}$/)
    //     .required()
    //     .messages({
    //         'string.base': 'Party mobile number must be a string',
    //         'string.length': 'Party mobile number must be exactly 10 digits',
    //         'string.pattern.base': 'Party mobile number must consist of 10 digits',
    //         'any.required': 'Party mobile number is required',
    //     }),

    loading_city: Joi.object({
        _id: Joi.string().optional(),
        cityID: Joi.number()
            .required()
            .messages({
                'number.base': 'City ID must be a number',
                'any.required': 'City ID is required',
            }),
        cityName: Joi.string()
            .required()
            .messages({
                'string.base': 'City name must be a string',
                'any.required': 'City name is required',
            }),
        stateID: Joi.number()
            .required()
            .messages({
                'number.base': 'State ID must be a number',
                'any.required': 'State ID is required',
            }),
        stateName: Joi.string()
            .required()
            .messages({
                'string.base': 'State name must be a string',
                'any.required': 'State name is required',
            }),
        stateShortName: Joi.string()
            .required()
            .messages({
                'string.base': 'State Short name must be a string',
                'any.required': 'State Short name is required',
            }),
        countryName: Joi.string()
            .required()
            .messages({
                'string.base': 'Country name must be a string',
                'any.required': 'Country name is required',
            }),
        countryID: Joi.number()
            .required()
            .messages({
                'number.base': 'Country ID must be a number',
                'any.required': 'Country ID is required',
            }),
    }).required()
        .messages({
            'object.base': 'Loading city must be an object',
            'any.required': 'Loading city is required',
        }),

    unloading_city: Joi.object({
        _id: Joi.string().optional(),
        cityID: Joi.number()
            .required()
            .messages({
                'number.base': 'City ID must be a number',
                'any.required': 'City ID is required',
            }),
        cityName: Joi.string()
            .required()
            .messages({
                'string.base': 'City name must be a string',
                'any.required': 'City name is required',
            }),
        stateID: Joi.number()
            .required()
            .messages({
                'number.base': 'State ID must be a number',
                'any.required': 'State ID is required',
            }),
        stateName: Joi.string()
            .required()
            .messages({
                'string.base': 'State name must be a string',
                'any.required': 'State name is required',
            }),
        stateShortName: Joi.string()
            .required()
            .messages({
                'string.base': 'State Short name must be a string',
                'any.required': 'State Short name is required',
            }),
        countryName: Joi.string()
            .required()
            .messages({
                'string.base': 'Country name must be a string',
                'any.required': 'Country name is required',
            }),
        countryID: Joi.number()
            .required()
            .messages({
                'number.base': 'Country ID must be a number',
                'any.required': 'Country ID is required',
            }),
    }).required()
        .messages({
            'object.base': 'Unloading city must be an object',
            'any.required': 'Unloading city is required',
        }),

    freigth: Joi.number()
        .required()
        .messages({
            'number.base': 'freigth must be a number',
            'any.required': 'freigth is required',
        }),

    advance: Joi.number()
        .required()
        .messages({
            'number.base': 'Advance must be a number',
            'any.required': 'Advance is required',
        }),

    balance: Joi.number()
        .required()
        .messages({
            'number.base': 'Balance must be a number',
            'any.required': 'Balance is required',
        }),

    cumition: Joi.number()
        .required()
        .messages({
            'number.base': 'Commission must be a number',
            'any.required': 'Commission is required',
        }),
    full_payment: Joi.number()
        .optional().default(0)
        .messages({
            'number.base': 'full payment must be a number',

        }),

    payment_date: Joi.date()
        .messages({
            'date.base': 'Payment date must be a valid date',
            'any.required': 'Payment date is required',
        }),

    driver_name: Joi.string()
        .required()
        .min(3)
        .max(40)
        .messages({
            'string.base': 'Driver name must be a string',
            'string.min': 'Driver name must be at least 3 characters long',
            'string.max': 'Driver name must be less than 40 characters long',
            'any.required': 'Driver name is required',
        }),

    driver_contact: Joi.string()
        .length(10)
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.base': 'Mobile number must be a string',
            'string.length': 'Mobile number must be exactly 10 digits',
            'string.pattern.base': 'Mobile number must consist of 10 digits',
            'any.required': 'Mobile number is required',
        }),

    distance_km: Joi.number()
        .required()
        .messages({
            'number.base': 'Distance (km) must be a number',
            'any.required': 'Distance (km) is required',
        }),

    speed_per_hr: Joi.number()
        .required()
        .messages({
            'number.base': 'Speed per km must be a number',
            'any.required': 'Speed per km is required',
        }),

    load_goods: Joi.string()
        .required()
        .min(5)
        .max(400)
        .messages({
            'string.base': 'Load goods must be a string',
            'string.min': 'Load goods must be at least 5 characters long',
            'string.max': 'Load goods must be less than 400 characters long',
            'any.required': 'Load goods is required',
        }),

    load_weigth: Joi.string()
        .required()
        .min(5)
        .max(400)
        .messages({
            'string.base': 'Load weight must be a string',
            'string.min': 'Load weight must be at least 5 characters long',
            'string.max': 'Load weight must be less than 400 characters long',
            'any.required': 'Load weight is required',
        })
});

export { tripHistory, tripHistoryValidation }
