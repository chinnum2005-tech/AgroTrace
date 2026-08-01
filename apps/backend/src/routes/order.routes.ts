import { Router } from 'express';
import { createOrder, getMyOrders, getFarmerOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticate);

// Create new order
router.post('/', createOrder);

// Get consumer's orders
router.get('/my-orders', getMyOrders);

// Get farmer's orders
router.get('/farmer-orders', getFarmerOrders);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

export default router;
