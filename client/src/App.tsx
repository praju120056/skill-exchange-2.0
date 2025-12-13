import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import HeroSection from './components/sections/HeroSection';
import Button from './components/ui/Button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </motion.div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Landing Page
const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen">
            <HeroSection
                title="Exchange Skills, Grow Together"
                subtitle="Connect with people who can teach what you want to learn, and share your expertise with others."
            >
                <div className="flex gap-4 justify-center mt-8">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/register')}
                    >
                        Get Started
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </Button>
                </div>
            </HeroSection>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '🎓',
                            title: 'Learn New Skills',
                            description: 'Find experts who can teach you the skills you want to master'
                        },
                        {
                            icon: '🤝',
                            title: 'Share Knowledge',
                            description: 'Teach others what you know and help them grow'
                        },
                        {
                            icon: '✨',
                            title: 'Smart Matching',
                            description: 'Our algorithm finds the perfect learning partners for you'
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            className="glass-card p-8 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-100 mb-3">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main App Component
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/matches"
                        element={
                            <ProtectedRoute>
                                <Matches />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'rgba(30, 27, 75, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        backdropFilter: 'blur(10px)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </AuthProvider>
    );
}

export default App;
