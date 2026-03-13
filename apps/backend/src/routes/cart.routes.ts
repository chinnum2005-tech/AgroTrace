import { Router } from 'express';
import { getMyCart, addToCart, removeFromCart, updateCartItem } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all cart routes
router.use(authenticate);

// Get current user's cart
router.get('/', getMyCart);

// Add item to cart
router.post('/add', addToCart);

// Remove item from cart
router.post('/remove', removeFromCart);

// Update cart item quantity
router.put('/update', updateCartItem);

export default router;
