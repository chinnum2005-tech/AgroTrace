import { Router } from 'express';
import { createOrder, getMyOrders, getFarmerOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticate);

// Create new order (Consumers & Admins)
router.post('/', authorize('CONSUMER', 'ADMIN'), createOrder);

// Get consumer's orders
router.get('/my-orders', authorize('CONSUMER', 'ADMIN'), getMyOrders);

// Get farmer's orders
router.get('/farmer-orders', authorize('FARMER', 'ADMIN'), getFarmerOrders);

// Update order status (Farmer, Distributor, Admin)
router.patch('/:orderId/status', authorize('FARMER', 'DISTRIBUTOR', 'ADMIN'), updateOrderStatus);

export default router;
