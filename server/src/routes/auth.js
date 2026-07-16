import express from 'express';
import { register, login, getMe, logout, googleLogin } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
