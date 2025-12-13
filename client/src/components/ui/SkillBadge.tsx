import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SkillBadgeProps {
    name: string;
    category?: string;
    variant?: 'primary' | 'secondary' | 'success';
    onRemove?: () => void;
    className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
    name,
    category,
    variant = 'primary',
    onRemove,
    className = ''
}) => {
    const variantClasses = {
        primary: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50',
        secondary: 'bg-amber-600/30 text-amber-300 border-amber-500/50',
        success: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
    };

    return (
        <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${variantClasses[variant]} ${className}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                {category && (
                    <span className="text-xs opacity-70">{category}</span>
                )}
            </div>

            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 hover:bg-white/10 rounded-full p-1 transition-colors"
                    aria-label="Remove skill"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </motion.div>
    );
};

export default SkillBadge;
