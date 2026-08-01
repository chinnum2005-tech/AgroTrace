import { Router } from 'express';
import { getMarketPrediction } from '../controllers/market.controller';

const router = Router();

// GET /api/v1/market/predictions?crop=wheat
router.get('/predictions', getMarketPrediction);

export default router;
