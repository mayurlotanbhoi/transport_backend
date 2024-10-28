
import mongoose, { Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const planHistorySchema = new Schema({
    plan_id: {
        type: Number,
        index: true

    },
    user_id: {
        type: Number,

    },
    activation_start_date: {
        type: String,
        required: true,
        trim: true,
    },
    activation_end_date: {
        type: String,
        required: true,
        trim: true,
    },
    activation_Plan: {
        type: String,
        required: true,
        trim: true,
        enum: ['Free', 'Silver', 'Golden', 'Daimond'],
        default: 'Free' // Optional: Set a default value if needed
    },
    amount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Auto-increment plan_id
planHistorySchema.plugin(AutoIncrement, { inc_field: 'plan_id' });

const PlanHistory = mongoose.model('plan_History', planHistorySchema);
export default PlanHistory;
