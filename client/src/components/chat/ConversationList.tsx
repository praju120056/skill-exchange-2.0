import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import type { Conversation } from '../../types/chat';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (conversation: Conversation) => void;
    isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
    isLoading
}) => {
    const { user } = useAuth();

    const getPartner = (conversation: Conversation) =>
        conversation.participants.find((p) => p._id !== user?.id);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="space-y-3 p-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-32" />
                            <div className="skeleton h-3 w-48" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <p className="text-gray-500 text-sm">No conversations yet.</p>
                <p className="text-gray-600 text-xs mt-1">Connect with a match to start chatting.</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto custom-scrollbar">
            {conversations.map((conv, i) => {
                const partner = getPartner(conv);
                const isSelected = selectedId === conv._id;
                const hasUnread = conv.unreadCount > 0;

                return (
                    <motion.button
                        key={conv._id}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                            isSelected
                                ? 'bg-indigo-600/30 border border-indigo-500/50'
                                : 'hover:bg-white/5 border border-transparent'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelect(conv)}
                        aria-label={`Open conversation with ${partner?.name}`}
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={partner?.avatarUrl}
                                alt={partner?.name}
                                className="w-12 h-12 rounded-full border-2 border-indigo-500/50"
                            />
                            {hasUnread && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className={`text-sm font-semibold truncate ${hasUnread ? 'text-white' : 'text-gray-200'}`}>
                                    {partner?.name}
                                </p>
                                {conv.lastMessage && (
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                        {formatTime(conv.lastMessage.timestamp)}
                                    </span>
                                )}
                            </div>
                            {conv.lastMessage ? (
                                <p className={`text-xs truncate ${hasUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {conv.lastMessage.text}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-600 italic">No messages yet</p>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default ConversationList;
