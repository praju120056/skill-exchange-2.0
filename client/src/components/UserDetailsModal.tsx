import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, BookOpen, UserPlus, UserCheck, Clock } from 'lucide-react';
import SkillBadge from './ui/SkillBadge';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';
import { sendConnectionRequest, getConnectionStatus } from '../services/chatService';
import type { Connection } from '../types/chat';

interface Skill {
    _id: string;
    name: string;
    category: string;
}

interface UserSkill {
    skillId: Skill;
    type: 'teach' | 'learn';
    proficiencyLevel: string;
}

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        _id: string;
        name: string;
        avatarUrl: string;
        teachingSkills: UserSkill[];
        learningSkills: UserSkill[];
    };
    matchCount: number;
    matchedSkills: Skill[];
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    isOpen,
    onClose,
    user,
    matchCount,
    matchedSkills
}) => {
    const [connection, setConnection] = React.useState<Connection | null>(null);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [statusLoading, setStatusLoading] = React.useState(false);

    // Load connection status when modal opens
    React.useEffect(() => {
        if (!isOpen || !user._id) return;

        const loadStatus = async () => {
            setStatusLoading(true);
            try {
                const res = await getConnectionStatus(user._id);
                setConnection(res.connection);
            } catch {
                // not critical — button will show default state
            } finally {
                setStatusLoading(false);
            }
        };

        loadStatus();
    }, [isOpen, user._id]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const conn = await sendConnectionRequest(user._id);
            setConnection(conn);
            toast.success(`Connection request sent to ${user.name}!`);
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || 'Failed to send request');
        } finally {
            setIsConnecting(false);
        }
    };

    const renderConnectionButton = () => {
        if (statusLoading) {
            return (
                <Button variant="outline" isLoading className="flex-1">
                    Checking...
                </Button>
            );
        }

        if (!connection) {
            return (
                <Button
                    variant="primary"
                    onClick={handleConnect}
                    isLoading={isConnecting}
                    icon={<UserPlus className="w-5 h-5" />}
                    className="flex-1"
                >
                    Send Connection Request
                </Button>
            );
        }

        if (connection.status === 'pending') {
            return (
                <Button
                    variant="outline"
                    disabled
                    icon={<Clock className="w-5 h-5" />}
                    className="flex-1"
                >
                    Request Pending
                </Button>
            );
        }

        if (connection.status === 'accepted') {
            return (
                <Button
                    variant="outline"
                    disabled
                    icon={<UserCheck className="w-5 h-5" />}
                    className="flex-1 border-emerald-500/50 text-emerald-300"
                >
                    Already Connected
                </Button>
            );
        }

        return null;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative border-b border-white/10 pb-4 mb-6">
                                <button
                                    onClick={onClose}
                                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                {matchCount > 0 && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/30 border border-indigo-500/50 rounded-full mb-4">
                                        <span className="text-indigo-300 font-semibold text-sm">
                                            🎯 {matchCount} {matchCount === 1 ? 'Skill' : 'Skills'} Match
                                        </span>
                                    </div>
                                )}

                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full border-4 border-indigo-500 shadow-neon-blue"
                                    />
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold gradient-text mb-2">
                                            {user.name}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Connect to start a private conversation
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Matched Skills Section */}
                            {matchedSkills.length > 0 && (
                                <div className="mb-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-xl font-bold text-gray-100">Can Teach You</h3>
                                    </div>
                                    <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {matchedSkills.map((skill) => (
                                                <SkillBadge
                                                    key={skill._id}
                                                    name={skill.name}
                                                    category={skill.category}
                                                    variant="primary"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Teaching Skills */}
                            <div className="mb-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-lg font-semibold text-gray-100">
                                        All Teaching Skills ({user.teachingSkills.length})
                                    </h3>
                                </div>
                                {user.teachingSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {user.teachingSkills.map((userSkill) => (
                                            <SkillBadge
                                                key={userSkill.skillId._id}
                                                name={userSkill.skillId.name}
                                                category={userSkill.skillId.category}
                                                variant="primary"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No teaching skills yet</p>
                                )}
                            </div>

                            {/* Learning Skills */}
                            <div className="mb-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <BookOpen className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-gray-100">
                                        Wants to Learn ({user.learningSkills.length})
                                    </h3>
                                </div>
                                {user.learningSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {user.learningSkills.map((userSkill) => (
                                            <SkillBadge
                                                key={userSkill.skillId._id}
                                                name={userSkill.skillId.name}
                                                category={userSkill.skillId.category}
                                                variant="secondary"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Not learning anything yet</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                                {renderConnectionButton()}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserDetailsModal;
