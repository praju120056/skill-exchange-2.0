import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, X, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import { respondToRequest } from '../../services/chatService';
import type { Connection } from '../../types/chat';

interface ConnectionRequestsProps {
    pending: Connection[];
    onResponded: (connectionId: string, conversationCreated?: boolean) => void;
    isLoading: boolean;
}

const ConnectionRequests: React.FC<ConnectionRequestsProps> = ({
    pending,
    onResponded,
    isLoading
}) => {
    const [responding, setResponding] = React.useState<string | null>(null);

    const handleRespond = async (connection: Connection, action: 'accepted' | 'declined') => {
        setResponding(connection._id);
        try {
            await respondToRequest(connection._id, action);
            toast.success(action === 'accepted' ? 'Connection accepted!' : 'Request declined');
            onResponded(connection._id, action === 'accepted');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Failed to respond');
        } finally {
            setResponding(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3 p-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="glass-card p-3">
                        <div className="flex items-center gap-3">
                            <div className="skeleton w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-28" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (pending.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <UserPlus className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-500 text-sm">No pending requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-2 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
                {pending.map((conn, i) => (
                    <motion.div
                        key={conn._id}
                        className="glass-card p-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={conn.requester.avatarUrl}
                                alt={conn.requester.name}
                                className="w-10 h-10 rounded-full border-2 border-indigo-500/50"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-200 truncate">
                                    {conn.requester.name}
                                </p>
                                <p className="text-xs text-gray-500">wants to connect</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                icon={<UserCheck className="w-4 h-4" />}
                                isLoading={responding === conn._id}
                                onClick={() => handleRespond(conn, 'accepted')}
                                className="flex-1"
                            >
                                Accept
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<X className="w-4 h-4" />}
                                isLoading={responding === conn._id}
                                onClick={() => handleRespond(conn, 'declined')}
                                className="flex-1 text-gray-400 hover:text-red-400"
                            >
                                Decline
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ConnectionRequests;
