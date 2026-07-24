import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMessages } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import type { Conversation, Message } from '../../types/chat';
import type { Socket } from 'socket.io-client';

interface TypingUser {
    userId: string;
    name: string;
}

interface ChatWindowProps {
    conversation: Conversation | null;
    socket: Socket | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, socket }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentConvIdRef = useRef<string | null>(null);

    const getPartner = (conv: Conversation) =>
        conv.participants.find((p) => p._id !== user?.id);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    // Load messages when conversation changes
    useEffect(() => {
        if (!conversation) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            setIsLoading(true);
            setMessages([]);
            currentConvIdRef.current = conversation._id;

            // Join the socket room
            socket?.emit('join:conversation', conversation._id);

            try {
                const { messages: fetched } = await getMessages(conversation._id);
                if (currentConvIdRef.current === conversation._id) {
                    setMessages(fetched);
                    setTimeout(() => scrollToBottom('instant'), 50);
                }
            } catch {
                // handled by interceptor
            } finally {
                if (currentConvIdRef.current === conversation._id) {
                    setIsLoading(false);
                }
            }
        };

        loadMessages();

        // Leave previous room when switching
        return () => {
            if (conversation._id) {
                socket?.emit('leave:conversation', conversation._id);
            }
        };
    }, [conversation, socket, scrollToBottom]);

    // Socket event listeners
    useEffect(() => {
        const sock = socket;
        if (!sock) return;

        const onNewMessage = (msg: Message) => {
            if (msg.conversationId === currentConvIdRef.current) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some((m) => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                setTimeout(() => scrollToBottom(), 50);
            }
        };

        const onTypingStart = ({ userId, name }: { userId: string; name: string }) => {
            if (userId !== user?.id) {
                setTypingUsers((prev) =>
                    prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, name }]
                );
            }
        };

        const onTypingStop = ({ userId }: { userId: string }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        };

        sock.on('message:new', onNewMessage);
        sock.on('typing:start', onTypingStart);
        sock.on('typing:stop', onTypingStop);

        return () => {
            sock.off('message:new', onNewMessage);
            sock.off('typing:start', onTypingStart);
            sock.off('typing:stop', onTypingStop);
        };
    }, [socket, user?.id, scrollToBottom]);

    const handleSend = useCallback(
        (text: string) => {
            if (!conversation || !socket || isSending) return;
            setIsSending(true);

            socket.emit(
                'message:send',
                { conversationId: conversation._id, text },
                () => {
                    setIsSending(false);
                }
            );
        },
        [conversation, socket, isSending]
    );

    const handleTyping = useCallback(
        (isTyping: boolean) => {
            if (!conversation || !socket) return;
            if (isTyping) {
                socket.emit('typing:start', { conversationId: conversation._id });
            } else {
                socket.emit('typing:stop', { conversationId: conversation._id });
            }
        },
        [conversation, socket]
    );

    // Empty state
    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Start a Conversation</h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                        Select a conversation from the left, or accept a connection request to begin chatting.
                    </p>
                </motion.div>
            </div>
        );
    }

    const partner = getPartner(conversation);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 flex-shrink-0">
                <img
                    src={partner?.avatarUrl}
                    alt={partner?.name}
                    className="w-10 h-10 rounded-full border-2 border-indigo-500"
                />
                <div>
                    <p className="font-semibold text-gray-100">{partner?.name}</p>
                    <AnimatePresence>
                        {typingUsers.length > 0 && (
                            <motion.p
                                className="text-xs text-indigo-400"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                typing…
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                                <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-40'}`} />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const isFirst =
                                idx === 0 ||
                                messages[idx - 1].sender._id !== msg.sender._id;
                            return (
                                <MessageBubble
                                    key={msg._id}
                                    message={msg}
                                    isFirst={isFirst}
                                />
                            );
                        })}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 flex-shrink-0 border-t border-white/10">
                <ChatInput
                    onSend={handleSend}
                    disabled={isSending}
                    onTyping={handleTyping}
                />
            </div>
        </div>
    );
};

export default ChatWindow;
