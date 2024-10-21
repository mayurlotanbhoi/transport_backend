import mongoose from 'mongoose';

const { Schema } = mongoose;



const citySchema = new Schema({
    cityID: {
        type: Number,
        required: true
    },
    cityName: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    stateID: {
        type: Number,
        required: true
    },
    stateName: {
        type: String,
        trim: true,
        required: true
    },
    stateShortName: {
        type: String,
        trim: true,
        required: true
    },
    countryName: {
        type: String,
        trim: true,
        required: true
    },
    countryID: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

export const City = mongoose.model('city_master', citySchema);

// export City;
