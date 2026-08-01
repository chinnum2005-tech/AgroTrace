import { Router } from 'express';
import { getAllCrops, getMyCrops, createCrop, updateCropStage, updateCropEstimate, updateCrop } from '../controllers/crop.controller';
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

// PATCH /api/crops/:id/estimate - Update crop estimated yield
router.patch('/:id/estimate', authorize('FARMER'), updateCropEstimate);

// PATCH /api/crops/:id - Update crop details
router.patch('/:id', authorize('FARMER'), updateCrop);

export default router;
