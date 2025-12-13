import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    children,
    className = ''
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    return (
        <motion.section
            className={`relative py-20 px-4 text-center ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h1
                className="text-5xl md:text-7xl font-bold mb-6 gradient-text text-shadow"
                variants={itemVariants}
            >
                {title}
            </motion.h1>

            {subtitle && (
                <motion.p
                    className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                    variants={itemVariants}
                >
                    {subtitle}
                </motion.p>
            )}

            {children && (
                <motion.div variants={itemVariants}>
                    {children}
                </motion.div>
            )}

            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1
                    }}
                />
            </div>
        </motion.section>
    );
};

export default HeroSection;
