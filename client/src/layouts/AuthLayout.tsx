import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <motion.div
                className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900 via-purple-900 to-midnight-950 relative overflow-hidden items-center justify-center p-12"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="relative z-10 text-center">
                    <motion.h1
                        className="text-6xl font-bold gradient-text mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Skill Exchange
                    </motion.h1>
                    <motion.p
                        className="text-2xl text-gray-300 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        Learn from others. Share your expertise.
                    </motion.p>

                    {/* Decorative elements */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16">
                        {['Programming', 'Design', 'Music', 'Language', 'Business', 'Cooking'].map((skill, idx) => (
                            <motion.div
                                key={skill}
                                className="badge badge-primary"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + idx * 0.1, duration: 0.3 }}
                            >
                                {skill}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Animated background blobs */}
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            </motion.div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="glass-card p-8">
                        <h2 className="text-3xl font-bold gradient-text mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-400 mb-8">{subtitle}</p>}
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
