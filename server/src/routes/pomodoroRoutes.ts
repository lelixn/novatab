import { Router } from 'express';
import { logSession, getStats } from '../controllers/pomodoroController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/log', logSession);
router.get('/stats', getStats);

export default router;
