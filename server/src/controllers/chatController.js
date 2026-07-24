import Joi from 'joi';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Validation schema
const sendMessageSchema = Joi.object({
    conversationId: Joi.string().required(),
    text: Joi.string().min(1).max(2000).required()
});

// Helper: verify the current user is a participant in a conversation
const verifyParticipant = async (conversationId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
    });
    return conversation;
};

// @desc    Get all conversations for current user (with last message preview)
// @route   GET /api/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name avatarUrl')
        .sort({ updatedAt: -1 });

    // Attach the last message and unread count for each conversation
    const enriched = await Promise.all(
        conversations.map(async (conv) => {
            const lastMessage = await Message.findOne({ conversationId: conv._id })
                .sort({ timestamp: -1 })
                .select('text sender timestamp read');

            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                read: false,
                sender: { $ne: userId }
            });

            return {
                _id: conv._id,
                participants: conv.participants,
                updatedAt: conv.updatedAt,
                lastMessage: lastMessage || null,
                unreadCount
            };
        })
    );

    res.status(200).json({ success: true, conversations: enriched });
});

// @desc    Get messages for a conversation (paginated, newest first)
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const conversation = await verifyParticipant(conversationId, userId);
    if (!conversation) {
        return res.status(403).json({ success: false, error: 'Access denied or conversation not found' });
    }

    const skip = (page - 1) * limit;
    const total = await Message.countDocuments({ conversationId });

    const messages = await Message.find({ conversationId })
        .populate('sender', 'name avatarUrl')
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit);

    // Mark messages from the other user as read
    await Message.updateMany(
        { conversationId, read: false, sender: { $ne: userId } },
        { $set: { read: true } }
    );

    res.status(200).json({
        success: true,
        messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Send a message via REST (socket is primary; this is the persistence layer)
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const { conversationId, text } = req.body;
    const userId = req.user.id;

    const conversation = await verifyParticipant(conversationId, userId);
    if (!conversation) {
        return res.status(403).json({ success: false, error: 'Access denied or conversation not found' });
    }

    const message = await Message.create({
        conversationId,
        sender: userId,
        text: text.trim()
    });

    // Update conversation's updatedAt so it bubbles to top of list
    conversation.updatedAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatarUrl');

    res.status(201).json({ success: true, message: populated });
});
