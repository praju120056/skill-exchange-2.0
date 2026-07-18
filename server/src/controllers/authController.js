import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/User.js';

// Validation schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    // Validate input
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        }
    });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    const otp = user.getResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    const message = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h1 style="color: #4f46e5;">Skill Exchange</h1>
            <p>You requested a password reset. Your One-Time Password (OTP) is:</p>
            <h2 style="background: #f3f4f6; padding: 15px; display: inline-block; letter-spacing: 5px; font-size: 24px; color: #1e1b4b; border-radius: 4px;">${otp}</h2>
            <p style="color: #ef4444;">This OTP is valid for 10 minutes.</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">If you did not request this, please ignore this email.</p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Skill Exchange - Password Reset OTP',
            html: message
        });
        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
        console.error('Email sending error:', err);
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email, otp, and new password' });
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Check if the user is trying to use the same password
    // (Only if they actually had a password before, Google-only users might not)
    if (user.password) {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            return res.status(400).json({ success: false, error: 'New password cannot be the same as your old password' });
        }
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'No token provided'
        });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with googleId if they don't have one
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatarUrl || user.avatarUrl.includes('ui-avatars.com')) {
                    user.avatarUrl = picture;
                }
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                avatarUrl: picture
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Google Auth Error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid Google token'
        });
    }
});

