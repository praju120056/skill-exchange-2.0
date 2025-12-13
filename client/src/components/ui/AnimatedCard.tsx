import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'interactive';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className = '',
    onClick,
    variant = 'default'
}) => {
    const isInteractive = variant === 'interactive';

    return (
        <motion.div
            className={`glass-card p-6 ${isInteractive ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isInteractive ? {
                y: -5,
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transition: { duration: 0.2 }
            } : {}}
            whileTap={isInteractive ? { scale: 0.98 } : {}}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
