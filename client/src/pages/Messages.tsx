import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, UserPlus, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConversationList from '../components/chat/ConversationList';
import ConnectionRequests from '../components/chat/ConnectionRequests';
import ChatWindow from '../components/chat/ChatWindow';
import useSocket from '../hooks/useSocket';
import { getConversations, getConnections } from '../services/chatService';
import { toast } from 'react-hot-toast';
import type { Conversation, Connection } from '../types/chat';

type LeftTab = 'messages' | 'requests';

const Messages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [pending, setPending] = useState<Connection[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [leftTab, setLeftTab] = useState<LeftTab>('messages');
    const [showMobileChat, setShowMobileChat] = useState(false);

    const socketRef = useSocket();

    const fetchConversations = useCallback(async () => {
        try {
            const convs = await getConversations();
            setConversations(convs);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Failed to load conversations');
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    const fetchConnections = useCallback(async () => {
        try {
            const { pending: pendingConns } = await getConnections();
            setPending(pendingConns);
        } catch {
            // silently handled by interceptor
        } finally {
            setIsLoadingRequests(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        fetchConnections();
    }, [fetchConversations, fetchConnections]);

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        setShowMobileChat(true);
        // Mark as read locally
        setConversations((prev) =>
            prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
        );
    };

    const handleRequestResponded = (connectionId: string, accepted?: boolean) => {
        setPending((prev) => prev.filter((c) => c._id !== connectionId));
        if (accepted) {
            // Refresh conversations to pick up newly created one
            fetchConversations();
            setLeftTab('messages');
        }
    };

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    return (
        <DashboardLayout>
            <div className="space-y-4">
                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <MessageSquare className="w-10 h-10 text-indigo-400" />
                    <div>
                        <h1 className="text-4xl font-bold gradient-text">Messages</h1>
                        <p className="text-gray-400 mt-1">
                            Chat privately with your connections
                        </p>
                    </div>
                    {pending.length > 0 && (
                        <div className="ml-auto">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 border border-amber-500/40 rounded-full text-amber-300 text-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>{pending.length} pending {pending.length === 1 ? 'request' : 'requests'}</span>
                            </motion.div>
                        </div>
                    )}
                </motion.div>

                {/* Main chat layout */}
                <motion.div
                    className="glass-card overflow-hidden"
                    style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="flex h-full">
                        {/* Left sidebar — hidden on mobile when chat is open */}
                        <div
                            className={`flex flex-col w-full md:w-80 border-r border-white/10 flex-shrink-0 ${
                                showMobileChat ? 'hidden md:flex' : 'flex'
                            }`}
                        >
                            {/* Tab switcher */}
                            <div className="flex border-b border-white/10 flex-shrink-0">
                                <button
                                    onClick={() => setLeftTab('messages')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                        leftTab === 'messages'
                                            ? 'text-indigo-300 border-b-2 border-indigo-500'
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                    aria-label="Messages tab"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Chats
                                    {totalUnread > 0 && (
                                        <span className="ml-1 w-5 h-5 bg-indigo-500 rounded-full text-white text-xs flex items-center justify-center">
                                            {totalUnread > 9 ? '9+' : totalUnread}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setLeftTab('requests')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                        leftTab === 'requests'
                                            ? 'text-amber-300 border-b-2 border-amber-500'
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                    aria-label="Connection requests tab"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Requests
                                    {pending.length > 0 && (
                                        <span className="ml-1 w-5 h-5 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center">
                                            {pending.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Tab content */}
                            <div className="flex-1 overflow-hidden">
                                {leftTab === 'messages' ? (
                                    <ConversationList
                                        conversations={conversations}
                                        selectedId={selectedConversation?._id ?? null}
                                        onSelect={handleSelectConversation}
                                        isLoading={isLoadingConversations}
                                    />
                                ) : (
                                    <ConnectionRequests
                                        pending={pending}
                                        onResponded={handleRequestResponded}
                                        isLoading={isLoadingRequests}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right panel — Chat window */}
                        <div
                            className={`flex-1 flex flex-col min-w-0 ${
                                !showMobileChat ? 'hidden md:flex' : 'flex'
                            }`}
                        >
                            {/* Mobile back button */}
                            {showMobileChat && (
                                <div className="md:hidden flex items-center gap-2 p-3 border-b border-white/10">
                                    <button
                                        onClick={() => setShowMobileChat(false)}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                                        aria-label="Back to conversation list"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        <span className="text-sm">Back</span>
                                    </button>
                                </div>
                            )}

                            <ChatWindow
                                conversation={selectedConversation}
                                socket={socketRef}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default Messages;
