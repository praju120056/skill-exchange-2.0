import express from 'express';
import {
    sendRequest,
    respondToRequest,
    getConnections,
    getConnectionStatus
} from '../controllers/connectionController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/request', protect, sendRequest);
router.post('/respond', protect, respondToRequest);
router.get('/', protect, getConnections);
router.get('/status/:userId', protect, getConnectionStatus);

export default router;
