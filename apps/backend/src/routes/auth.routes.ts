import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validator';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

// Token refresh route (no auth required, uses refresh token)
router.post('/refresh-token', refreshToken);

export default router;
