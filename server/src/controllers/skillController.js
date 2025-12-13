import Joi from 'joi';
import asyncHandler from '../utils/asyncHandler.js';
import Skill from '../models/Skill.js';
import UserSkill from '../models/UserSkill.js';
import User from '../models/User.js';

// Validation schemas
const skillSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    category: Joi.string().valid(
        'Programming', 'Design', 'Marketing', 'Business', 'Music',
        'Language', 'Writing', 'Fitness', 'Cooking', 'Photography',
        'Video Editing', 'Other'
    ).required()
});

const userSkillSchema = Joi.object({
    skillId: Joi.string().required(),
    type: Joi.string().valid('teach', 'learn').required(),
    proficiencyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert')
});

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getAllSkills = asyncHandler(async (req, res) => {
    const { category, search } = req.query;

    let query = {};

    if (category) {
        query.category = category;
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: skills.length,
        skills
    });
});

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private
export const createSkill = asyncHandler(async (req, res) => {
    // Validate input
    const { error } = skillSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const skill = await Skill.create(req.body);

    res.status(201).json({
        success: true,
        skill
    });
});

// @desc    Get user's skills
// @route   GET /api/skills/user/:userId
// @access  Public
export const getUserSkills = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { type } = req.query; // 'teach' or 'learn'

    let query = { userId };
    if (type) {
        query.type = type;
    }

    const userSkills = await UserSkill.find(query)
        .populate('skillId', 'name category')
        .populate('userId', 'name email avatarUrl')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: userSkills.length,
        userSkills
    });
});

// @desc    Add skill to user
// @route   POST /api/skills/user
// @access  Private
export const addUserSkill = asyncHandler(async (req, res) => {
    // Validate input
    const { error } = userSkillSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const { skillId, type, proficiencyLevel } = req.body;

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
        return res.status(404).json({
            success: false,
            error: 'Skill not found'
        });
    }

    // Create user skill
    const userSkill = await UserSkill.create({
        userId: req.user.id,
        skillId,
        type,
        proficiencyLevel
    });

    const populatedUserSkill = await UserSkill.findById(userSkill._id)
        .populate('skillId', 'name category');

    res.status(201).json({
        success: true,
        userSkill: populatedUserSkill
    });
});

// @desc    Remove skill from user
// @route   DELETE /api/skills/user/:userSkillId
// @access  Private
export const removeUserSkill = asyncHandler(async (req, res) => {
    const { userSkillId } = req.params;

    const userSkill = await UserSkill.findById(userSkillId);

    if (!userSkill) {
        return res.status(404).json({
            success: false,
            error: 'User skill not found'
        });
    }

    // Make sure user owns this skill
    if (userSkill.userId.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to delete this skill'
        });
    }

    await userSkill.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Skill removed successfully'
    });
});

// @desc    Find matching users (The Matching Engine)
// @route   GET /api/skills/matches
// @access  Private
export const findMatches = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get skills the current user wants to learn
    const skillsToLearn = await UserSkill.find({
        userId,
        type: 'learn'
    }).select('skillId');

    if (skillsToLearn.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'Add skills you want to learn to find matches',
            matches: []
        });
    }

    const skillIds = skillsToLearn.map(skill => skill.skillId);

    // Find users who teach those skills
    const potentialMatches = await UserSkill.aggregate([
        {
            $match: {
                skillId: { $in: skillIds },
                type: 'teach',
                userId: { $ne: userId }
            }
        },
        {
            $group: {
                _id: '$userId',
                matchedSkillIds: { $push: '$skillId' },
                matchCount: { $sum: 1 }
            }
        },
        {
            $sort: { matchCount: -1 }
        },
        {
            $limit: 20
        }
    ]);

    // Get complete user data with all their skills
    const matches = await Promise.all(
        potentialMatches.map(async (match) => {
            // Get user info
            const user = await User.findById(match._id).select('name email avatarUrl');

            // Get all teaching skills
            const teachingSkills = await UserSkill.find({
                userId: match._id,
                type: 'teach'
            }).populate('skillId', 'name category');

            // Get all learning skills
            const learningSkills = await UserSkill.find({
                userId: match._id,
                type: 'learn'
            }).populate('skillId', 'name category');

            // Get matched skills (intersection of what they teach and what I want to learn)
            const matchedSkills = await Skill.find({
                _id: { $in: match.matchedSkillIds }
            });

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                matchCount: match.matchCount,
                teachingSkills,
                learningSkills,
                matchedSkills
            };
        })
    );

    res.status(200).json({
        success: true,
        count: matches.length,
        matches
    });
});
