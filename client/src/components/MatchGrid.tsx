import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import AnimatedCard from './ui/AnimatedCard';
import SkillBadge from './ui/SkillBadge';
import UserDetailsModal from './UserDetailsModal';
import { Match } from '../types/match';

interface MatchGridProps {
    matches: Match[];
    isLoading?: boolean;
}

const MatchGrid: React.FC<MatchGridProps> = ({ matches, isLoading = false }) => {
    const [selectedUser, setSelectedUser] = useState<Match | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="glass-card p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="skeleton w-16 h-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-6 w-32" />
                                <div className="skeleton h-4 w-24" />
                            </div>
                        </div>
                        <div className="skeleton h-20 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
            >
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                    No matches found yet
                </h3>
                <p className="text-gray-500">
                    Add skills you want to learn on the Dashboard to find matches!
                </p>
            </motion.div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, idx) => (
                    <motion.div
                        key={match._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <AnimatedCard
                            className="group cursor-pointer"
                            onClick={() => setSelectedUser(match)}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={match.avatarUrl}
                                    alt={match.name}
                                    className="w-16 h-16 rounded-full border-2 border-indigo-500 group-hover:border-amber-500 transition-colors"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-violet-300 transition-colors">
                                        {match.name}
                                    </h3>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600/30 border border-indigo-500/50 rounded-full mt-1">
                                        <span className="text-indigo-300 font-medium text-xs">
                                            {match.matchCount} {match.matchCount === 1 ? 'match' : 'matches'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-gray-400 font-medium">Can teach you:</p>
                                <div className="flex flex-wrap gap-2">
                                    {match.matchedSkills.slice(0, 3).map((skill) => (
                                        <SkillBadge
                                            key={skill._id}
                                            name={skill.name}
                                            category={skill.category}
                                            variant="primary"
                                        />
                                    ))}
                                    {match.matchedSkills.length > 3 && (
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                            <span className="text-xs text-gray-400">
                                                +{match.matchedSkills.length - 3} more
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AnimatedCard>
                    </motion.div>
                ))}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetailsModal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    user={selectedUser}
                    matchCount={selectedUser.matchCount}
                    matchedSkills={selectedUser.matchedSkills}
                />
            )}
        </>
    );
};

export default MatchGrid;
