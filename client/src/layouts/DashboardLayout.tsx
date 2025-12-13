import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, UserCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Find Matches', path: '/matches', icon: Sparkles },
        { name: 'Profile', path: '/profile', icon: UserCircle },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen">
            {/* Top Navigation */}
            <motion.nav
                className="glass-card m-4 p-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold gradient-text">Skill Exchange</h1>
                    </Link>

                    <div className="flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden md:inline">{item.name}</span>
                                </Link>
                            );
                        })}

                        <div className="h-8 w-px bg-white/20" />

                        <div className="flex items-center gap-3">
                            <img
                                src={user?.avatarUrl}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full border-2 border-indigo-500"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Main Content Area */}
            <motion.main
                className="max-w-7xl mx-auto p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                {children}
            </motion.main>
        </div>
    );
};

export default DashboardLayout;
