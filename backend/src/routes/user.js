import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateSettingsSchema } from '../validations/user.js';
import { getSettings, updateSettings } from '../controllers/userController.js';

const router = Router();

router.get('/settings', auth, getSettings);
router.put('/settings', auth, validate(updateSettingsSchema), updateSettings);

export default router;
