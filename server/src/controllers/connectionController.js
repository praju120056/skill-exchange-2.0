import Joi from 'joi';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import Connection from '../models/Connection.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Validation schemas
const requestSchema = Joi.object({
    recipientId: Joi.string().required()
});

const respondSchema = Joi.object({
    connectionId: Joi.string().required(),
    action: Joi.string().valid('accepted', 'declined').required()
});

// @desc    Send a connection request
// @route   POST /api/connections/request
// @access  Private
export const sendRequest = asyncHandler(async (req, res) => {
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const { recipientId } = req.body;
    const requesterId = req.user.id;

    // Can't connect with yourself
    if (requesterId === recipientId) {
        return res.status(400).json({ success: false, error: 'You cannot connect with yourself' });
    }

    // Validate recipientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if a connection already exists in either direction
    const existing = await Connection.findOne({
        $or: [
            { requester: requesterId, recipient: recipientId },
            { requester: recipientId, recipient: requesterId }
        ]
    });

    if (existing) {
        const statusMsg = {
            pending: 'A connection request is already pending',
            accepted: 'You are already connected with this user',
            declined: 'Connection request was previously declined'
        };
        return res.status(400).json({ success: false, error: statusMsg[existing.status] });
    }

    const connection = await Connection.create({
        requester: requesterId,
        recipient: recipientId
    });

    res.status(201).json({ success: true, connection });
});

// @desc    Accept or decline a connection request
// @route   POST /api/connections/respond
// @access  Private
export const respondToRequest = asyncHandler(async (req, res) => {
    const { error } = respondSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const { connectionId, action } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
        return res.status(400).json({ success: false, error: 'Invalid connection ID' });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
        return res.status(404).json({ success: false, error: 'Connection request not found' });
    }

    // Only the recipient can respond
    if (connection.recipient.toString() !== userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to respond to this request' });
    }

    if (connection.status !== 'pending') {
        return res.status(400).json({ success: false, error: 'This request has already been responded to' });
    }

    connection.status = action;
    await connection.save();

    let conversation = null;

    // On acceptance, create the conversation if it doesn't already exist
    if (action === 'accepted') {
        conversation = await Conversation.findOne({
            participants: { $all: [connection.requester, connection.recipient] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [connection.requester, connection.recipient]
            });
        }
    }

    res.status(200).json({
        success: true,
        connection,
        conversation: conversation || undefined
    });
});

// @desc    Get all connections for current user (accepted only + pending incoming)
// @route   GET /api/connections
// @access  Private
export const getConnections = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Accepted connections (either direction)
    const accepted = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'accepted'
    })
        .populate('requester', 'name avatarUrl')
        .populate('recipient', 'name avatarUrl')
        .sort({ updatedAt: -1 });

    // Pending requests directed AT the current user (inbox)
    const pending = await Connection.find({
        recipient: userId,
        status: 'pending'
    })
        .populate('requester', 'name avatarUrl')
        .sort({ createdAt: -1 });

    // Pending requests sent BY the current user (outbox)
    const sent = await Connection.find({
        requester: userId,
        status: 'pending'
    })
        .populate('recipient', 'name avatarUrl')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        accepted,
        pending,
        sent
    });
});

// @desc    Get connection status between current user and another user
// @route   GET /api/connections/status/:userId
// @access  Private
export const getConnectionStatus = asyncHandler(async (req, res) => {
    const myId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const connection = await Connection.findOne({
        $or: [
            { requester: myId, recipient: userId },
            { requester: userId, recipient: myId }
        ]
    });

    res.status(200).json({
        success: true,
        connection: connection || null
    });
});
