import Joi from 'joi';
import asyncHandler from '../utils/asyncHandler.js';
import geminiService from '../services/geminiService.js';

// Validation schema
const askSchema = Joi.object({
    skill: Joi.string().min(1).max(100).required(),
    question: Joi.string().min(5).max(500).required()
});

// Simple in-memory per-user rate limiter
// Map: userId → { count, windowStart }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per user

const checkRateLimit = (userId) => {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        // Fresh window
        rateLimitMap.set(userId, { count: 1, windowStart: now });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count += 1;
    return true;
};

// @desc    Ask the AI Mentor a question about a skill
// @route   POST /api/ai/ask
// @access  Private
export const askAI = asyncHandler(async (req, res) => {
    const { error } = askSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const userId = req.user.id;

    // Enforce per-user rate limit
    if (!checkRateLimit(userId)) {
        return res.status(429).json({
            success: false,
            error: 'Too many AI requests. Please wait a moment before asking again.'
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
            success: false,
            error: 'AI Mentor is not configured. Please add GEMINI_API_KEY to server environment.'
        });
    }

    const { skill, question } = req.body;

    const answer = await geminiService.askMentor(skill, question);

    res.status(200).json({ success: true, answer });
});
