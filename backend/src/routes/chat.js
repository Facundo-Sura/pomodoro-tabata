import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { sendMessage, getHistory } from '../controllers/chatController.js';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/history', auth, getHistory);

export default router;
