import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIMentorButtonProps {
    skillName: string;
    onClick: (skillName: string) => void;
}

const AIMentorButton: React.FC<AIMentorButtonProps> = ({ skillName, onClick }) => {
    return (
        <motion.button
            onClick={() => onClick(skillName)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/40 hover:border-cyan-400/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Ask AI about ${skillName}`}
            title={`Ask AI Mentor about ${skillName}`}
        >
            <Sparkles className="w-3 h-3" />
            Ask AI
        </motion.button>
    );
};

export default AIMentorButton;
