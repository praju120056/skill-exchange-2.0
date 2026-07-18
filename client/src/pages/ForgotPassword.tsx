import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgotpassword', { email });
            if (res.success) {
                toast.success('OTP sent to your email!');
                setStep(2);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.put('/auth/resetpassword', { email, otp, password: newPassword });
            if (res.success) {
                toast.success('Password reset successfully! You can now login.');
                navigate('/login');
            }
        } catch (error: any) {
            toast.error(error.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={step === 1 ? 'Reset Password' : 'Enter OTP'}
            subtitle={step === 1 ? 'Enter your email to receive a 6-digit code' : `Enter the code sent to ${email}`}
        >
            {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <Input
                        type="email"
                        name="email"
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        icon={<Mail className="w-5 h-5" />}
                        className="w-full"
                    >
                        Send OTP
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <Input
                        type="text"
                        name="otp"
                        label="6-Digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        name="newPassword"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        className="w-full"
                    >
                        Reset Password
                    </Button>
                </form>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="text-gray-400 hover:text-violet-400 text-sm font-medium transition-colors">
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
