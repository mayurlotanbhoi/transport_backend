import mongoose, { Schema } from "mongoose";


const AchivementId = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
})

const achivementIdSeq = mongoose.model("AchivementId", AchivementId)



const achievementSchema = new Schema({
    achivementId: {
        type: Number,
        unique: true,
    },
    entryDatetime: {
        type: Date,
        default: Date.now, // Sets default value to current date and time when document is created
    },
    entryInSamaj: {
        curentSamaj: {
            type: String,
            trim: true,
        },
        id: {
            type: Number,
            trim: true,
        }
    },

    samajToShow: {
        type: [{
            text: {
                type: String,
                required: true
            },
            id: {
                type: Number,
                required: true
            }
        }], // Array of dropdown options

    },
    entryMemberCode: {
        type: String,
        trim: true,
        required: true,
    },
    memberName: {
        type: String,
        trim: true,
        required: true,
    },
    achievementHeading: {
        type: String,
        trim: true,
        required: true, // Field is required
    },
    achiverName: {
        type: String,
        trim: true,
        required: true, // Field is required
    },
    message: {
        type: String,
        trim: true,
        required: true, // Field is required
    },
    profilePhoto: {
        type: String,
        trim: true,
        required: true

    },
    photo1: {
        type: String,
        trim: true,

    },
    photo2: {
        type: String,
        trim: true,

    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});




// Middleware to auto-increment ID
achievementSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }
    try {
        const counter = await achivementIdSeq.findByIdAndUpdate(
            { _id: 'achivementId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true },
        );

        this.achivementId = counter.seq;
        next();
    } catch (error) {
        next(error);
    }
});


const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
