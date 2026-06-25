import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createSessionSchema, listSessionsSchema } from '../validations/sessions.js';
import { createSession, listSessions, getStats } from '../controllers/sessionsController.js';

const router = Router();

router.get('/stats', auth, getStats);
router.get('/', auth, validate(listSessionsSchema, 'query'), listSessions);
router.post('/', auth, validate(createSessionSchema), createSession);

export default router;
