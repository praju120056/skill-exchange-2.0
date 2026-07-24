import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * Initialise Socket.IO on the HTTP server.
 * Each authenticated user joins a personal room: `user:<userId>`
 * Conversation rooms follow: `conv:<conversationId>`
 */
const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    // --- JWT authentication middleware ---
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    // --- Connection handler ---
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Join the user's personal room for direct delivery
        socket.join(`user:${userId}`);

        // --- Join a conversation room ---
        socket.on('join:conversation', async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId
                });
                if (conversation) {
                    socket.join(`conv:${conversationId}`);
                }
            } catch {
                // silently ignore invalid ids
            }
        });

        // --- Leave a conversation room ---
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conv:${conversationId}`);
        });

        // --- Send a message via socket ---
        socket.on('message:send', async ({ conversationId, text }, ack) => {
            try {
                if (!conversationId || !text || !text.trim()) {
                    if (ack) ack({ success: false, error: 'Invalid message' });
                    return;
                }

                // Verify participant
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId
                });

                if (!conversation) {
                    if (ack) ack({ success: false, error: 'Access denied' });
                    return;
                }

                // Persist the message
                const message = await Message.create({
                    conversationId,
                    sender: userId,
                    text: text.trim().slice(0, 2000)
                });

                // Update conversation timestamp so it sorts to top
                conversation.updatedAt = new Date();
                await conversation.save();

                const populated = await Message.findById(message._id)
                    .populate('sender', 'name avatarUrl');

                // Broadcast to everyone in the conversation room
                io.to(`conv:${conversationId}`).emit('message:new', populated);

                // Acknowledge to sender
                if (ack) ack({ success: true, message: populated });
            } catch (err) {
                console.error('Socket message:send error:', err);
                if (ack) ack({ success: false, error: 'Failed to send message' });
            }
        });

        // --- Typing indicators ---
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conv:${conversationId}`).emit('typing:start', {
                userId,
                name: socket.user.name
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conv:${conversationId}`).emit('typing:stop', { userId });
        });

        // --- Graceful disconnect ---
        socket.on('disconnect', () => {
            // Socket.IO automatically leaves all rooms on disconnect
        });
    });

    return io;
};

export default initSocket;
