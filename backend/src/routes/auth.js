import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { auth } from '../middlewares/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  googleSchema,
} from '../validations/auth.js';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  googleAuth,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refreshToken);
router.post('/logout', validate(logoutSchema), logout);
router.get('/me', auth, getMe);
router.post('/google', validate(googleSchema), googleAuth);

export default router;
