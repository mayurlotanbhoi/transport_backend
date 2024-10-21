import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const transportDetailSchema = new mongoose.Schema({
    transport_id: {
        type: Number,  // auto-incremented ID
    },
    user_id: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    registration_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    transport_name: {
        type: String,
        required: [true, 'transport name required'],
        trim: true
    },
    mobile_number: {
        type: Number,
        required: [true, 'mobile number required'],
    },
    address: {
        type: String,
        required: [true, 'address required'],
        trim: true
    },
    owner_name: {
        type: String,
        required: [true, 'owner name required'],
        trim: true
    },
    city: {
        cityID: { type: Number, required: true },
        cityName: { type: String, trim: true, required: true },
        stateID: { type: Number, required: true },
        stateName: { type: String, trim: true, required: true },
        stateShortName: { type: String, trim: true, required: true },
        countryName: { type: String, trim: true, required: true },
        countryID: { type: Number, required: true }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Apply auto-increment plugin to `transport_id`
transportDetailSchema.plugin(AutoIncrement, { inc_field: 'transport_id' });

// Create and export the model
const TransportDetail = mongoose.model('TransportDetail', transportDetailSchema);
export default TransportDetail;
