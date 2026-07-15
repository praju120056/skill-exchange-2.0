import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

// Prevent duplicate connection requests between the same pair
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Fast lookup: "show me all pending requests directed at this user"
connectionSchema.index({ recipient: 1, status: 1 });

// Fast lookup: "all my connections regardless of direction"
connectionSchema.index({ requester: 1, status: 1 });

export default mongoose.model('Connection', connectionSchema);
