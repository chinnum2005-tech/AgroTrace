import { Router } from 'express';
import { getAllFarms, getMyFarm, createFarm, updateMyFarm, getMyDashboardStats } from '../controllers/farm.controller';
import { authenticate, authorize } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/farms - Get all farms (admin only)
router.get('/', authorize('ADMIN'), auditLogger('GET_ALL_FARMS'), getAllFarms);

// GET /api/farms/my-farm - Get farmer's own farm
router.get('/my-farm', authorize('FARMER'), getMyFarm);

// POST /api/farms - Create new farm (farmer only)
router.post('/', authorize('FARMER'), createFarm);

// PUT /api/farms/my-farm - Update farmer's own farm
router.put('/my-farm', authorize('FARMER'), updateMyFarm);

// GET /api/farms/my-stats - Get real dashboard stats for farmer
router.get('/my-stats', authorize('FARMER'), getMyDashboardStats);

export default router;
