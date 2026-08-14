import { Router } from 'express';
import { generateTestToken } from '../controllers/auth.controller.js';

const router = Router();

router.post('/api/v1/auth/token', generateTestToken);

export default router;
