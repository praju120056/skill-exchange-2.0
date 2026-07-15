import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
    message: Message;
    isFirst?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isFirst = false }) => {
    const { user } = useAuth();
    const isOwn = message.sender._id === user?.id;

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Avatar — shown for incoming messages or first in group */}
            {!isOwn && (
                <img
                    src={message.sender.avatarUrl}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full border border-indigo-500/30 flex-shrink-0 mb-1"
                />
            )}
            {isOwn && <div className="w-8 flex-shrink-0" />}

            <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender name for incoming (only on first in group) */}
                {!isOwn && isFirst && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">{message.sender.name}</span>
                )}

                {/* Bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isOwn
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-br-md shadow-neon-blue'
                            : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-100 rounded-bl-md'
                    }`}
                >
                    {message.text}
                </div>

                {/* Timestamp */}
                <span className={`text-xs text-gray-600 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                    {formatTime(message.timestamp)}
                    {isOwn && (
                        <span className="ml-1">
                            {message.read ? (
                                <span className="text-indigo-400" title="Read">✓✓</span>
                            ) : (
                                <span className="text-gray-600" title="Sent">✓</span>
                            )}
                        </span>
                    )}
                </span>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
