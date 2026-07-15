import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Ask the AI Mentor a question in the context of a specific skill.
 *
 * @param {string} skillContext - The skill the user is currently viewing (e.g. "React")
 * @param {string} question     - The user's question
 * @returns {Promise<string>}   - The AI's response text
 */
const askMentor = async (skillContext, question) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `You are a practical mentor helping someone learn skills through peer teaching.

The user is currently viewing the skill: ${skillContext}

Their question: ${question}

Instructions:
- Answer in fewer than 250 words
- Be specific and actionable
- Avoid generic platitudes
- If mentioning code, use code blocks
- Focus on what they can do right now`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

export default { askMentor };
