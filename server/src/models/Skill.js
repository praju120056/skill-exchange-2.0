import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Programming',
            'Design',
            'Marketing',
            'Business',
            'Music',
            'Language',
            'Writing',
            'Fitness',
            'Cooking',
            'Photography',
            'Video Editing',
            'Other'
        ],
        default: 'Other'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index for better query performance
skillSchema.index({ name: 1, category: 1 });

export default mongoose.model('Skill', skillSchema);
