import mongoose, { Schema } from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import generateCode from '../utils/acivationCodeGanrate.js';
import autoIncrementFactory from 'mongoose-sequence';
import Joi from 'joi';

// Initialize the auto-increment plugin with the mongoose instance
// const autoIncrement = autoIncrementFactory(mongoose);

// Schema for auto-incrementing user IDs
const UserSeqSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const UserSeq = mongoose.model('UserSeq', UserSeqSchema);

// Main User Schema
const userSchema = new Schema({
    user_id: {
        type: Number,
        index: true,
        unique: true,
    },
    user_type: {
        type: Number,
        default: 2,
        enum: [1, 2, 3], // Define the possible user types
    },
    user_code: {
        type: String,
        default: '',
        trim: true,
    },
    owner_name: { // Corrected field name
        type: String,
        required: [true, 'Owner name is required'],
        trim: true,
    },
    company_name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    mobile_number: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        unique: true, // Ensure unique email addresses
        match: [/^\d{10}$/, 'Invalid mobile number'], // Example validation for 10-digit numbers
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        match: [/.+\@.+\..+/, 'Invalid email address'], // Simple email validation
    },
    logo: {
        type: String,
        required: [true, 'Logo URL is required'],
        trim: true,
    },
    avatar: {
        type: String,
        required: [true, 'avatar URL is required'],
        trim: true,
    },

    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
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
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    current_plan_id: {
        type: Number,

    },

    access_token: {
        type: String,
        default: '', // Ensure default value or constraints as needed
    },
    refresh_token: { // Corrected field name
        type: String,
        default: '', // Ensure default value or constraints as needed
    },
    registration_date_time: {
        type: Date,
        default: Date.now, // Sets default value to current date and time when document is created
    },
    route: {
        type: String,
        required: [true, 'route required'],
        trim: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});



const userValidation = Joi.object({
    user_id: Joi.number().optional().allow(null, '').messages({
        'number.base': 'User ID must be a number',
    }),
    user_type: Joi.number().valid(1, 2, 3).default(2),
    owner_name: Joi.string().required().messages({
        'any.required': 'Owner name is required',
    }),
    company_name: Joi.string().required().messages({
        'any.required': 'Company name is required',
    }),
    mobile_number: Joi.string().pattern(/^\d{10}$/).required().messages({
        'any.required': 'Mobile number is required',
        'string.pattern.base': 'Invalid mobile number',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email address',
    }),
    // Make fields like avatar and logo optional, as they might be set later
    logo: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Logo URL must be a string',
    }),
    avatar: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Avatar URL must be a string',
    }),
    address: Joi.string().required().messages({
        'any.required': 'Address is required',
    }),
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
    description: Joi.string().required().messages({
        'any.required': 'Description is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
    current_plan_id: Joi.number().optional().allow(null, '').messages({
    }),
    route: Joi.string()
        .required()
        .min(3)
        .max(4000)
        .messages({
            'string.base': 'Route must be a string',
            'string.min': 'Route must be at least 3 characters long',
            'string.max': 'Route must be less than 4000 characters long',
            'any.required': 'Route is required',
        }),
    // Other optional fields
    access_token: Joi.string().optional().allow(null, ''),
    refresh_token: Joi.string().optional().allow(null, ''),
    registration_date_time: Joi.date().default(Date.now),
});





// Apply autoIncrement plugin to the user_id field
// userSchema.plugin(autoIncrement, { inc_field: 'user_id' });

// Middleware to handle user ID and password hashing
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await UserSeq.findByIdAndUpdate(
                { _id: 'UserSeq' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.user_id = counter.seq;
            console.log("data", this)

            this.user_code = generateCode("TRS", this.user_id);

        } catch (error) {

            return next(error); // Handle error if sequence update fails
        }
    }

    if (this.isModified('password')) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (error) {
            return next(error); // Handle error if password hashing fails
        }
    }

    next(); // Proceed to save the document
});

// userSchema.plugin(autoIncrement, { inc_field: 'user_id' });

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            user_code: this.user_code,
            mobile_number: this.mobile_number,
            mobile_number: this.isActive,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);

export {
    userValidation
};

