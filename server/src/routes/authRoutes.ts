import { Router } from 'express';
import { register, login, getProfile, updateSettings, googleAuth } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.patch('/settings', authenticate, updateSettings);
router.post('/google', googleAuth);

export default router;
