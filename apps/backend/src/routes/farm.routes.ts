import { Router } from 'express';
import { getAllFarms, getMyFarm, createFarm } from '../controllers/farm.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/farms - Get all farms (admin only)
router.get('/', authorize('ADMIN'), getAllFarms);

// GET /api/farms/my-farm - Get farmer's own farm
router.get('/my-farm', authorize('FARMER'), getMyFarm);

// POST /api/farms - Create new farm (farmer only)
router.post('/', authorize('FARMER'), createFarm);

export default router;
