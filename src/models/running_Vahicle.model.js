import mongoose, { Schema } from 'mongoose';
import autoIncrementFactory from 'mongoose-sequence';

// Initialize the auto-increment plugin with the mongoose instance
const autoIncrement = autoIncrementFactory(mongoose);

const runningVahicleSchema = new Schema({
    user_id: {
        type: Number,
        required: true
    },
    running_id: {
        type: Number,
        unique: true
    },
    dispatch_date_time: {
        type: Date,
        required: true
    },
    arrival_date_time: {
        type: Date,
        required: true
    },
    loading_at: {
        type: String,
        required: true,
        trim: true
    },
    goods: {
        type: String,
        required: true,
        trim: true
    },
    unloading_at: {
        type: String,
        trim: true
    },
    lorry_number: {
        type: String,
        required: true,
        trim: true
    },
    transport_name: {
        type: String,
        required: true,
        trim: true
    },
    rent_amount: {
        type: Number,
        required: true
    },
    rent_advance_amount: {
        type: Number
    },
    remaining_amount: {
        type: Number
    },
    isCommition_pay: {
        type: Boolean,
        default: false
    },
    recovery_amount: {
        type: Number
    },
    payment_date: {
        type: Date
    },
    payment_method: {
        type: String,
        trim: true
    },
    distance_km: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Add auto-incrementing functionality to running_id
runningVahicleSchema.plugin(autoIncrement, { inc_field: 'running_id' });

const RunningVahicle = mongoose.model('RunningVahicle', runningVahicleSchema);
export default RunningVahicle;
