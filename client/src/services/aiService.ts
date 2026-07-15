import api from '../utils/api';

/**
 * Ask the AI Mentor a question in the context of a skill.
 * The API key stays server-side — we only send skill + question.
 */
export const askAIMentor = async (skill: string, question: string): Promise<string> => {
    const res = await api.post('/ai/ask', { skill, question });
    return res.answer;
};
