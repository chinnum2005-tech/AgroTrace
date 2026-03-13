import { Router } from 'express';
import {
  getProductTraceability,
  addSupplyChainEvent,
  getRecentEvents,
  getMyProductEvents,
} from '../controllers/supplyChain.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route - Get traceability for a product (anyone can view)
router.get('/trace/:productId', getProductTraceability);

// Public route - Get recent events (for dashboard displays)
router.get('/recent', getRecentEvents);

// Protected routes
router.use(authenticate);

// Get events for farmer's products
router.get('/my-products', getMyProductEvents);

// Add new supply chain event (distributor/farmer/consumer)
router.post('/add', addSupplyChainEvent);

export default router;
