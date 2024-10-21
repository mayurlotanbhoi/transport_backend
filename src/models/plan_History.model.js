import mongoose, { Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose);

const planHistorySchema = new Schema({
    plan_id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
        trim: true,
    },
    activationStartDate: {
        type: String,
        required: true,
        trim: true,
    },
    activationEndDate: {
        type: String,
        required: true,
        trim: true,
    },
    activationPlan: {
        type: String,
        required: true,
        trim: true,
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
