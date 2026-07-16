import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (credentialResponse.credential) {
            try {
                await googleLogin(credentialResponse.credential);
                navigate('/dashboard');
            } catch (error) {
                console.error('Google login error:', error);
            }
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue your skill exchange journey"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <Input
                    type="password"
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    icon={<LogIn className="w-5 h-5" />}
                    className="w-full"
                >
                    Sign In
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-900 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Google Login Failed')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <p className="text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
                        Create one now
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;
