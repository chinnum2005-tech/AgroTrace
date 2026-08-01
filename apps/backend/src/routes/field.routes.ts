import { Router } from 'express';
import { createField, addSoilReading, getMyFields } from '../controllers/field.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All field routes require FARMER role
router.use(authenticate, authorize('FARMER'));

// Get all fields for the current farmer
router.get('/', getMyFields);

// Create a new field (with polygon)
router.post('/', createField);

// Add soil data to a field
router.post('/:fieldId/soil', addSoilReading);

export default router;
