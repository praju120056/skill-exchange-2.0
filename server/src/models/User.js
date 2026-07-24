import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [
            function() { return !this.googleId; }, 
            'Please provide a password'
        ],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatarUrl: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=random'
    },
    resetPasswordOtp: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate avatar URL based on user name
userSchema.pre('save', function (next) {
    if (!this.avatarUrl || this.avatarUrl === 'https://ui-avatars.com/api/?background=random') {
        this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random&size=200`;
    }
    next();
});

// Generate and hash password reset OTP
userSchema.methods.getResetPasswordOtp = function () {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    this.resetPasswordOtp = otp;
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return otp;
};

export default mongoose.model('User', userSchema);
