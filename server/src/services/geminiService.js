import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

dotenv.config();

// Safety initialization
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

/**
 * Ask the AI Mentor a question in the context of a specific skill.
 *
 * @param {string} skillContext - The skill the user is currently viewing (e.g. "React")
 * @param {string} question     - The user's question
 * @returns {Promise<string>}   - The AI's response text
 */
const askMentor = async (skillContext, question) => {
    if (!genAI) {
        return "AI Mentor is not configured. Please add GEMINI_API_KEY to server environment.";
    }

    const prompt = `You are a practical mentor helping someone learn skills through peer teaching.

The user is currently viewing the skill: ${skillContext}

Their question: ${question}

Instructions:
- Answer in fewer than 250 words
- Be specific and actionable
- Avoid generic platitudes
- If mentioning code, use code blocks
- Focus on what they can do right now`;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(`Gemini API Error (${modelName}):`, error);
        }
    }

    return "Sorry, all AI models are currently unavailable.";
};

export default { askMentor };