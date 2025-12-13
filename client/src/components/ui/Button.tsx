import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    className = '',
    disabled,
    onClick,
    type,
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-neon-blue hover:scale-105',
        secondary: 'bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:shadow-neon hover:scale-105',
        outline: 'border-2 border-indigo-500 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400',
        ghost: 'text-indigo-300 hover:bg-white/5'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : icon ? (
                <span className="inline-flex">{icon}</span>
            ) : null}
            <span>{children}</span>
        </motion.button>
    );
};

export default Button;
