import express from 'express';
import {
    getAllSkills,
    createSkill,
    getUserSkills,
    addUserSkill,
    removeUserSkill,
    findMatches
} from '../controllers/skillController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/user/:userId', getUserSkills);

// Protected routes
router.post('/', protect, createSkill);
router.post('/user', protect, addUserSkill);
router.delete('/user/:userSkillId', protect, removeUserSkill);
router.get('/matches', protect, findMatches);

export default router;
