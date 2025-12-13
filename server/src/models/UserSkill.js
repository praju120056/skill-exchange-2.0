import mongoose from 'mongoose';

const userSkillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    type: {
        type: String,
        enum: ['teach', 'learn'],
        required: [true, 'Type must be either teach or learn']
    },
    proficiencyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: function () {
            return this.type === 'teach' ? 'intermediate' : 'beginner';
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can't have the same skill with the same type twice
userSkillSchema.index({ userId: 1, skillId: 1, type: 1 }, { unique: true });

// Index for efficient querying
userSkillSchema.index({ userId: 1, type: 1 });
userSkillSchema.index({ skillId: 1, type: 1 });

export default mongoose.model('UserSkill', userSkillSchema);
