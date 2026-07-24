import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    read: {
        type: Boolean,
        default: false
    },
    edited: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Primary query: fetch all messages in a conversation ordered by time
messageSchema.index({ conversationId: 1, timestamp: 1 });

// Secondary query: count unread messages per conversation
messageSchema.index({ conversationId: 1, read: 1 });

export default mongoose.model('Message', messageSchema);
