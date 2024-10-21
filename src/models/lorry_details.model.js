import Joi from 'joi';
import mongoose, { Schema, Types } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const vehicaleDetailsSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
        index: true
    },

    vehicale_type: {
        type: String,
        required: true,
        trim: true,
    },
    vehicale_capacity: {
        type: String,
        required: true,
        trim: true,
    },
    vehicale_length: {
        type: String,
        required: true,
        trim: true,
    },

    lorry_number: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    owner_name: {
        type: String,
        required: true,
        trim: true,
    },
    owner_mobile_number: {
        type: String,
        required: [true, "Mobile number is required"],
        trim: true,
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
        minlength: [10, "Mobile number must be exactly 10 digits"],
        maxlength: [10, "Mobile number must be exactly 10 digits"],
    },
    owner_addres: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 400
    },

    permit_photo: {
        type: String,
        required: true,
        trim: true,
    },
    permit_expire_date: {
        type: Date,
        required: true,
        trim: true,
    },
    insurance_photo: {
        type: String,
        required: true,
        trim: true,
    },
    insurance_expire_date: {
        type: Date,
        required: true,
        trim: true,
    },
    fitness_expire_date: {
        type: Date,
        required: true,
        trim: true,
    },
    owner_photo: {
        type: String,
        required: true,
        trim: true,
    },
    owner_city
        : {
        _id: { type: Types.ObjectId },
        cityID: { type: Number, required: true },
        cityName: { type: String, trim: true, required: true },
        stateID: { type: Number, required: true },
        stateName: { type: String, trim: true, required: true },
        stateShortName: { type: String, trim: true, required: true },
        countryName: { type: String, trim: true, required: true },
        countryID: { type: Number, required: true }
    },
    owner_pancard_number: {
        type: String,
        required: true,
        trim: true,
    },
    aadharcard_number: {
        type: Number,
        length: 12,
        required: true,
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Middleware to handle user ID and password hashing
// vehicaleDetailsSchema.pre('save', async function (next) {
//     if (this.isNew) {
//         try {
//             const counter = await UserSeq.findByIdAndUpdate(
//                 { _id: 'UserSeq' },
//                 { $inc: { seq: 1 } },
//                 { new: true, upsert: true }
//             );
//             this.user_id = counter.seq;
//         } catch (error) {
//             return next(error); // Handle error if sequence update fails
//         }
//     }
//     next(); // Proceed to save the document
// });
vehicaleDetailsSchema.plugin(AutoIncrement, { inc_field: 'lorry_id' });
// Create the lorry_details model
const vehicaleDetails = mongoose.model('vehicaleDetails', vehicaleDetailsSchema);


// Joi validation schema
const vehicleSchema = Joi.object({
    // user_id: Joi.string()
    //     .required()
    //     .messages({
    //         'any.required': 'user id is required',
    //     }),
    lorry_number: Joi.string()
        .length(10)
        .pattern(/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/)
        .required()
        .messages({
            'string.base': 'Lorry number must be a string',
            'string.length': 'Vehicale number must be exactly 10 digits',
            'string.pattern.base': "Invalid lorry number format. Expected format: XX 00 XX 0000",
            'any.required': 'Lorry number is required',
        }),

    owner_name: Joi.string()
        .required()
        .min(3)
        .max(40)
        .messages({
            'string.base': 'Owner name must be a string',
            'string.min': 'Owner name must be at least 3 characters long',
            'string.max': 'Owner name must be less than 40 characters long',
            'any.required': 'Owner name is required',
        }),

    owner_addres: Joi.string()
        .required()
        .min(3)
        .max(400)
        .messages({
            'string.base': 'Owner address must be a string',
            'string.min': 'Owner address must be at least 3 characters long',
            'string.max': 'Owner address must be less than 400 characters long',
            'any.required': 'Owner address is required',
        }),

    owner_city: Joi.object({
        _id: Joi.string() // Optional field for MongoDB ObjectId
            .optional()
            .messages({
                'string.base': '_id must be a valid string',
            }),
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
            'object.base': 'Owner city must be an object',
            'any.required': 'Owner city is required',
        }),

    owner_pancard_number: Joi.string()
        .length(10)
        .pattern(/^[A-Z]{5}\d{4}[A-Z]{1}$/)
        .required()
        .messages({
            'string.base': 'Pancard number must be a string',
            'string.length': 'Pancard number must be exactly 10 digits',
            'string.pattern.base': 'Invalid PAN card number format',
            'any.required': 'Pancard number is required',
        }),

    aadharcard_number: Joi.string()
        .length(12)
        .pattern(/^\d{12}$/)
        .required()
        .messages({
            'string.base': 'Aadhar card number must be a string',
            'string.length': 'Aadhar card number must be exactly 12 digits',
            'string.pattern.base': 'Aadhar card number must consist of 12 digits',
            'any.required': 'Aadhar card number is required',
        }),

    owner_mobile_number: Joi.string()
        .length(10)
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.base': 'Mobile number must be a string',
            'string.length': 'Mobile number must be exactly 10 digits long',
            'string.pattern.base': 'Mobile number must consist of 10 digits',
            'any.required': 'Mobile number is required',
        }),

    fitness_expire_date: Joi.date()
        .required()
        .messages({
            'date.base': 'Fitness expiry date must be a valid date',
            'any.required': 'Fitness expiry date is required',
        }),

    insurance_expire_date: Joi.date()
        .required()
        .messages({
            'date.base': 'Insurance expiry date must be a valid date',
            'any.required': 'Insurance expiry date is required',
        }),

    permit_expire_date: Joi.date()
        .required()
        .messages({
            'date.base': 'Permit expiry date must be a valid date',
            'any.required': 'Permit expiry date is required',
        }),

    vehicale_capacity: Joi.string()
        .required()
        .messages({
            'string.base': 'Vehicle capacity must be a string',
            'any.required': 'Vehicle capacity is required',
        }),
    vehicale_length: Joi.string()
        .required()
        .messages({
            'string.base': 'Vehicle length must be a string',
            'any.required': 'Vehicle length is required',
        }),

    vehicale_type: Joi.string()
        .required()
        .messages({
            'string.base': 'Vehicle type must be a string',
            'any.required': 'Vehicle type is required',
        }),
    owner_photo: Joi.string(),
    permit_photo: Joi.string(),
    insurance_photo: Joi.string()


});

export {
    vehicleSchema,
    vehicaleDetails
}




// export default LorryDetails;
