import { Router } from 'express';
import { getAllCrops, getMyCrops, createCrop, updateCropStage } from '../controllers/crop.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/crops - Get all crops (admin only)
router.get('/', authorize('ADMIN'), getAllCrops);

// GET /api/crops/my-crops - Get farmer's own crops
router.get('/my-crops', authorize('FARMER'), getMyCrops);

// POST /api/crops - Create new crop (farmer only)
router.post('/', authorize('FARMER'), createCrop);

// PATCH /api/crops/:id/stage - Update crop growth stage
router.patch('/:id/stage', authorize('FARMER'), updateCropStage);

export default router;
