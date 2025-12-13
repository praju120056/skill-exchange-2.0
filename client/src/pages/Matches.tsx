import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import MatchGrid from '../components/MatchGrid';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Match } from '../types/match';

const Matches: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const response = await api.get('/skills/matches');
            if (response.success) {
                setMatches(response.matches);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-3"
                >
                    <Sparkles className="w-10 h-10 text-indigo-400" />
                    <div>
                        <h1 className="text-4xl font-bold gradient-text">Find Your Match</h1>
                        <p className="text-gray-400 mt-1">
                            Connect with people who can teach what you want to learn
                        </p>
                    </div>
                </motion.div>

                {/* Match Count */}
                {!isLoading && matches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-full text-emerald-300"
                    >
                        <span className="font-semibold">{matches.length}</span>
                        <span>{matches.length === 1 ? 'match' : 'matches'} found</span>
                    </motion.div>
                )}

                {/* Matches Grid */}
                <MatchGrid matches={matches} isLoading={isLoading} />
            </div>
        </DashboardLayout>
    );
};

export default Matches;
