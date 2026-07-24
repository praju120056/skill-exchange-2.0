import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ]
    },
    { timestamps: true }
);

// Look up all conversations a given user is part of
conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);
